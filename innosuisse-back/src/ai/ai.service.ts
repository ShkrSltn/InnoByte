import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Company } from '../entities/company.entity';
import { FundingRound } from '../entities/deals.entity';

@Injectable()
export class AiService {
  private model: ChatOpenAI;
  private schemaInfo: string;
  private sqlChain: RunnableSequence;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(FundingRound)
    private fundingRoundsRepository: Repository<FundingRound>,
  ) {
    this.model = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o',
      temperature: 0.3,
    });

    this.schemaInfo = `
    You are working with a startup funding database.

    Table: companies
    Columns:
    - code: TEXT (PRIMARY KEY)
    - title: TEXT
    - industry: TEXT
    - vertical: TEXT
    - canton: TEXT
    - spin_offs: TEXT
    - city: TEXT
    - year: INTEGER
    - highlights: TEXT
    - gender_ceo: TEXT
    - oob: BOOLEAN
    - funded: BOOLEAN
    - comment: TEXT

    Table: deals (funding_rounds)
    Columns:
    - id: TEXT (PRIMARY KEY)
    - investors: TEXT
    - amount: NUMERIC
    - valuation: NUMERIC
    - comment: TEXT
    - url: TEXT
    - confidential: BOOLEAN
    - amount_confidential: BOOLEAN
    - date_of_the_funding_round: DATE
    - type: TEXT
    - phase: TEXT
    - canton: TEXT
    - company: TEXT
    - gender_ceo: TEXT
    - company_code: TEXT (Foreign key references companies.code)

    Important notes for date handling:
    - Use CURRENT_DATE for current date
    - Use INTERVAL for date arithmetic
    - Example for last 5 years: date_of_the_funding_round >= CURRENT_DATE - INTERVAL '5 years'
    `;

    const promptTemplate = PromptTemplate.fromTemplate(`
    ${this.schemaInfo}

    Write a SQL query to answer the following question. 
    Return ONLY the final SQL query without explanation, surrounded by triple backticks.
    
    Important guidelines:
    - Do not use escape sequences like \\n in your SQL
    - Write the full query on a single line or use regular line breaks, not escape sequences
    - Use proper SQL formatting with spaces between clauses
    - Always end your query with a semicolon
    - For numeric columns (amount, valuation) always filter out NULL values when:
      * Using them in sorting with ORDER BY
      * Comparing values (top N, max, min, average, etc.)
      * Performing aggregations (SUM, AVG, etc.)
    - Example: "SELECT * FROM deals WHERE amount IS NOT NULL ORDER BY amount DESC LIMIT 5;"
    - For percentage calculations, cast numbers as float: CAST(count(*) AS FLOAT)
    - Always use table aliases in joins and qualify column names with table aliases
    - When multiple tables are involved, always specify which table each column belongs to
    
    Never use the following keywords in your query:
    - code: TEXT (PRIMARY KEY)
    - company_code: TEXT (Foreign key references companies.code)
    - id: TEXT (PRIMARY KEY)
       
    Question: {userQuery}
    `);

    this.sqlChain = RunnableSequence.from([
      promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);
  }

  async generateSqlQuery(userQuery: string): Promise<string> {
    const response = await this.sqlChain.invoke({ userQuery });
    return response;
  }

  async executeQuery(sqlQuery: string): Promise<any> {
    try {
      if (!sqlQuery.trim().toLowerCase().startsWith('select')) {
        throw new Error('Only SELECT queries are allowed');
      }

      const result = await this.fundingRoundsRepository.query(sqlQuery);
      return result;
    } catch (error) {
      throw new Error(`Error executing query: ${error.message}`);
    }
  }

  async validateQueryContext(userQuery: string): Promise<boolean> {
    const contextValidationPrompt = PromptTemplate.fromTemplate(`
      You are a context validator for a Swiss startup funding database.
      
      Determine if the following query is relevant to:
      1. Swiss startups
      2. Startup funding and investments
      3. Company analysis in Switzerland
      4. Startup ecosystem metrics
      5. Investment trends and patterns
      
      Query: {userQuery}
      
      Respond only with "true" if the query is relevant to the context, or "false" if it's off-topic.
      `);

    const validationChain = RunnableSequence.from([
      contextValidationPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    const result = await validationChain.invoke({ userQuery });
    return result.toLowerCase().includes('true');
  }

  async analyzeData(userQuery: string): Promise<any> {
    try {
      const isValidContext = await this.validateQueryContext(userQuery);
      if (!isValidContext) {
        throw new Error(
          'Query is not relevant to Swiss startup funding context. Please ask questions related to startup investments, funding rounds, or company analysis in Switzerland.',
        );
      }

      const sqlQuery = await this.generateSqlQuery(userQuery);

      const regex =
        /```sql\s+([\s\S]*?)\s*```|`(SELECT[\s\S]*?);`|SELECT[\s\S]*?;/i;
      const match = sqlQuery.match(regex);

      let extractedQuery = '';
      if (match) {
        extractedQuery = match[1] || match[2] || match[0];
        extractedQuery = extractedQuery.replace(/```sql|```/g, '').trim();

        extractedQuery = extractedQuery.replace(/\\n/g, ' ');
      } else {
        throw new Error('Could not extract SQL query from AI response');
      }

      const result = await this.executeQuery(extractedQuery);
      const filteredResult = this.removeRestrictedFields(result);

      return {
        query: extractedQuery,
        result: filteredResult,
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  async analyzeDataWithRetries(
    userQuery: string,
    maxRetries: number = 3,
  ): Promise<any> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(
          `Attempt ${attempt} of ${maxRetries} for query: ${userQuery}`,
        );

        const result = await this.analyzeData(userQuery);

        if (result && result.result && result.result.length > 0) {
          console.log(
            `Successful result on attempt ${attempt} with ${result.result.length} rows`,
          );
          result.result = this.removeRestrictedFields(result.result);
          return {
            ...result,
            attempts: attempt,
          };
        }

        console.log(
          `Attempt ${attempt} returned empty results, trying again...`,
        );
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed with error: ${error.message}`);
      }
    }

    if (lastError) {
      throw new Error(
        `Failed after ${maxRetries} attempts: ${lastError.message}`,
      );
    } else {
      return {
        query: null,
        result: [],
        attempts: attempt,
        message: `No results found after ${maxRetries} attempts`,
      };
    }
  }

  async analyzeDataAndExplain(
    userQuery: string,
    maxRetries: number = 3,
    maxWords: number = 100,
  ): Promise<any> {
    const analysisResult = await this.analyzeDataWithRetries(
      userQuery,
      maxRetries,
    );

    if (!analysisResult.result || analysisResult.result.length === 0) {
      return {
        ...analysisResult,
        explanation: 'No data found to explain.',
        specificAnswer:
          'Unable to provide a specific answer due to lack of data.',
      };
    }

    try {
      const explanation = await this.generateExplanation(
        analysisResult.query,
        analysisResult.result,
        maxWords,
      );

      const specificAnswer = await this.generateSpecificAnswer(
        userQuery,
        analysisResult.result,
      );

      if (analysisResult.result) {
        analysisResult.result = this.removeRestrictedFields(
          analysisResult.result,
        );
      }

      return {
        ...analysisResult,
        explanation,
        specificAnswer,
      };
    } catch (error) {
      if (analysisResult.result) {
        analysisResult.result = this.removeRestrictedFields(
          analysisResult.result,
        );
      }

      return {
        ...analysisResult,
        explanation: `Could not generate explanation: ${error.message}`,
        specificAnswer: `Could not generate specific answer: ${error.message}`,
      };
    }
  }

  private removeRestrictedFields(data: any[]): any[] {
    if (!Array.isArray(data)) {
      return data;
    }

    return data.map((item) => {
      const filteredItem = { ...item };

      if ('code' in filteredItem) {
        delete filteredItem.code;
      }
      if ('id' in filteredItem) {
        delete filteredItem.id;
      }
      if ('company_code' in filteredItem) {
        delete filteredItem.company_code;
      }
      if ('vertical' in filteredItem) {
        delete filteredItem.vertical;
      }

      return filteredItem;
    });
  }

  async generateSpecificAnswer(
    userQuery: string,
    queryResults: any[],
  ): Promise<string> {
    const specificAnswerPrompt = PromptTemplate.fromTemplate(`
      You are an AI assistant specializing in Swiss startup ecosystem analysis.
      
      Original user question: {userQuery}
      
      Data from analysis (JSON format):
      {queryResults}
      
      Please provide a direct, specific answer to the user's question based on the data.
      Requirements for the answer:
      1. Start with a clear, direct statement that answers the main question
      2. Include specific numbers and facts from the data
      3. Keep it concise but informative (2-3 sentences)
      4. Focus only on the most relevant information to answer the question
      5. Use precise language and avoid generalizations
      
      Format: Provide only the final answer without any additional explanations or metadata.
    `);

    const answerChain = RunnableSequence.from([
      specificAnswerPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    return await answerChain.invoke({
      userQuery,
      queryResults: JSON.stringify(queryResults, null, 2),
    });
  }

  private async generateExplanation(
    query: string,
    results: any[],
    maxWords: number,
  ): Promise<string> {
    const explainPrompt = PromptTemplate.fromTemplate(`
      ${this.schemaInfo}

      The following SQL query was executed:
      \`\`\`sql
      ${query}
      \`\`\`

      And it returned the following results (JSON format):
      ${JSON.stringify(results, null, 2).replace(/{/g, '{{').replace(/}/g, '}}')}

      Please analyze these results with a focus on startup ecosystem insights for Swiss startups and investors.
      - Identify emerging trends in funding, valuations, or sector growth
      - Highlight notable patterns that would be valuable for benchmarking
      - Compare performance metrics where possible (by canton, industry, year, etc.)
      - Note any significant outliers or changes that indicate market shifts
      - Emphasize insights that increase transparency in the Swiss startup ecosystem
      - Consider both investor perspective (opportunity identification) and startup perspective (benchmarking)
      
      Format requirements:
      - Write in a clear, professional tone suitable for startup founders and investors
      - Use simple paragraph format with plain text only (no bullet points or special formatting)
      - Focus on actionable insights rather than just describing the data
      - Write no more than ${maxWords} words
      - Do not mention SQL, queries, or the technical aspects of data retrieval
    `);

    const explainChain = RunnableSequence.from([
      explainPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    return await explainChain.invoke({});
  }
}
