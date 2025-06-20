export function LoadingSpinner() {
  return (
    <div className="flex flex-col gap-4 flex-1 justify-center items-center h-64">
      <p className="font-semibold text-lg text-gray-600">Loading...</p>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
