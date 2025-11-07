export default function ToggleSwitch({ isOn, size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-10 h-5",
    lg: "w-12 h-6",
  };

  const circleSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const translateClasses = {
    sm: "translate-x-4",
    md: "translate-x-5",
    lg: "translate-x-6",
  };

  return (
    <div
      className={`${sizeClasses[size]} relative inline-flex items-center rounded-full transition-colors duration-200 ${
        isOn ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`${circleSizeClasses[size]} inline-block rounded-full bg-white transform transition-transform duration-200 ${
          isOn ? translateClasses[size] : "translate-x-0.5"
        }`}
      />
    </div>
  );
}
