import { Rocket, Briefcase } from "lucide-react";

interface UserTypeFilterProps {
  chosenUserType: string | null;
  setChosenUserType: (value: string | null) => void;
}

export const UserTypeFilter = ({
  chosenUserType,
  setChosenUserType,
}: UserTypeFilterProps) => {
  const isStartup = chosenUserType === "startup";

  return (
    <div className="flex items-center gap-4">
      <span className="text-lg h-[40px] flex items-center justify-center">
        I am
      </span>

      <div className="relative inline-flex bg-gray-100 rounded-full p-1 shadow-inner min-w-[240px]">
        <span
          className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-red-500 shadow-md transition-transform duration-300 ${
            isStartup ? "translate-x-0" : "translate-x-full"
          }`}
        />

        <button
          onClick={() => setChosenUserType("startup")}
          className={`relative z-10 w-1/2 px-3 py-2 flex items-center justify-center gap-2 text-base font-medium rounded-full transition-colors duration-300 ${
            isStartup ? "text-white" : "text-gray-700"
          }`}
        >
          <Rocket className="w-4 h-4" />
          Startup
        </button>

        <button
          onClick={() => setChosenUserType("investor")}
          className={`relative z-10 w-1/2 px-3 py-2 flex items-center justify-center gap-2 text-base font-medium rounded-full transition-colors duration-300 ${
            !isStartup ? "text-white" : "text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Investor
        </button>
      </div>
    </div>
  );
};
