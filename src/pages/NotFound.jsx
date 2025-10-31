import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleStartDrawing = () => {
    navigate("/editor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            Draw<span className="text-blue-600">DB</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            免费、简单、直观的数据库设计工具和 SQL 生成器
          </p>
        </div>

        {/* Main CTA Button */}
        <div>
          <button
            onClick={handleStartDrawing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            开始设计数据库
          </button>
        </div>
      </div>
    </div>
  );
}
