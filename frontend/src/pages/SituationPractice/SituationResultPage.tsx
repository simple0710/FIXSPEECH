import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import VoiceMetricCard from "../../shared/components/VoiceQuality/VoiceMetricCard";
import MetricsVisualizer from "../../shared/components/VoiceQuality/MetricsVisualizer";
import { METRIC_CRITERIA } from "../../shared/constants/voiceMetrics";
import GradientCirclePlanes from "../../shared/components/Loader/GradientCirclePlanes";
import useHistoryColorStore from "../../shared/stores/historyColorStore";

interface AnalysisDetailResponse {
  userId: number;
  scriptId: number;
  metrics: {
    [key: string]: {
      unit: string;
      grade: "excellent" | "good" | "poor";
      value: number;
      reference: string;
      interpretation: string;
    };
  };
  overallScore: number;
  recommendations: string[];
  recordAddress: string;
  scriptName: string;
  scriptContent: string;
  createdAt: string;
}

const VoiceAnalysisDetailPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { selectedColor } = useHistoryColorStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchAnalysisDetail = async () => {
      try {
        const response = await axiosInstance.get(`script/result/detail/${resultId}`);
        setAnalysisData(response.data.data);
        console.log(response.data.data);
        const audioObj = new Audio(response.data.data.recordAddress);
        setAudio(audioObj);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError("분석 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisDetail();
  }, [resultId]);

  const handlePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getScoreColor = (metrics: AnalysisDetailResponse["metrics"]) => {
    const grades = Object.values(metrics).map((m) => m.grade);
    const excellent = grades.filter((g) => g === "excellent").length;
    const good = grades.filter((g) => g === "good").length;

    if (excellent >= 5)
      return { color: "#00FF88", shadow: "0 0 20px rgba(0, 255, 136, 0.5)" };
    if (excellent + good >= 5)
      return { color: "#FFD700", shadow: "0 0 20px rgba(255, 215, 0, 0.5)" };
    return { color: "#FF4D4D", shadow: "0 0 20px rgba(255, 77, 77, 0.5)" };
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GradientCirclePlanes />
        <p className="mt-8 text-white text-lg">분석 데이터를 불러오는 중...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/analysis")}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );

  if (!analysisData || !analysisData.metrics) return null;

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{analysisData.scriptName}</h1>
          <span className="text-gray-400">{analysisData.createdAt}</span>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 mb-8">
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors"
          >
            {isPlaying ? "일시정지" : "음성 재생"}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-bold mb-4">전체 평가</h2>
              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-2"
                  style={{
                    color: getScoreColor(analysisData.metrics).color,
                    textShadow: getScoreColor(analysisData.metrics).shadow,
                  }}
                >
                  {
                    Object.values(analysisData.metrics).filter(
                      (m) => m.grade === "excellent"
                    ).length
                  }
                </div>
                <p className="text-gray-400">우수 항목 개수</p>
              </div>
            </div>

            <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-bold mb-4">메트릭 시각화</h2>
              <MetricsVisualizer
                metrics={analysisData.metrics}
                colorScheme={selectedColor}
              />
            </div>
            <div className="aspect-square w-full bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-bold mb-4">대본 내용</h2>
              <p>{analysisData.scriptContent}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysisData.metrics).map(([name, data]) => (
                <VoiceMetricCard
                  key={name}
                  name={name}
                  data={data}
                  criteria={METRIC_CRITERIA[name as keyof typeof METRIC_CRITERIA]}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/situation/result")}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalysisDetailPage;