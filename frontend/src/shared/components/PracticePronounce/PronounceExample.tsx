import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useVoiceStore from "../../../shared/stores/voiceStore";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { ExampleGet } from "../../../services/PronouncePractice/PronouncePracticeGet";
import ArrowRight from "../Icons/ArrowRightIcon";
import usePronounceScoreStore from "../../../shared/stores/pronounceScoreStore";
import FinishModal from "./FinishModal";
import useSttStore from "../../stores/sttStore";
import { sttPost } from "../../../services/PronouncePractice/PronouncePracticePost";
import useNextArrowState from "../../stores/nextArrowStore";
import { pronounceFinishPost } from "../../../services/PronouncePractice/PronouncePracticePost";

interface PronounceExampleProps {
  color: string; // color prop의 타입 정의
  trainingId: number;
  size: number;
}

function PronounceExample({ color, trainingId, size }: PronounceExampleProps) {
  const { audioURL, isRecording, setIsRecording, setAudioURL } =
    useVoiceStore();
  const { isNumber, setIsNumber, setIsCorrect, setIsNumberZero, setIsNumberMinus } =
    usePronounceScoreStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // 현재 재생 상태
  const [example, setExample] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const {userStt, setUserStt} = useSttStore();
  const [differences, setDifferences] = useState<any[]>([]);
  const {isNext, setIsNext} = useNextArrowState();
  const [isBefore, setIsBefore] = useState<string | null>(null);

  const navigate = useNavigate();


  const postStt = async() => {
    const data = {
      answer_text: example,
      user_text: userStt
    }

    try{
      const response = await sttPost(data)
      console.log(response.data)
      setDifferences(response.data.differences || [])
      if (response.data.similarity === 1){
        setIsCorrect();
      }

      if (isBefore !== example) {
        setIsNumber(); // 다른 문장일 때만 카운트 증가
        setIsBefore(example); // 현재 연습한 문장을 isBefore에 저장
      }

      setIsNext(true)
    } catch(e) {
      console.log (e)
    }
  }

  const finishPost = async() => {
    try{
      const response = await pronounceFinishPost() 
      console.log(response.data)
    } catch(e) {
      console.log(e)
    }
  }


  useEffect(() => {
    if (!isRecording && userStt !== '') {
      postStt();
    }

  }, [isRecording, userStt])

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause(); // 재생 중일 경우 일시 정지
        setIsPlaying(false);
      } else {
        audioRef.current.play(); // 일시 정지 중일 경우 재생
        setIsPlaying(true);
      }
    }
  };

  // 연습 문제 가져오기
  const getExample = async () => {
    setIsNext(false)
    setUserStt('')
    setDifferences([])
    try {
      const response = await ExampleGet(trainingId);
      setExample(response.data);
    } catch (e) {
      console.log(e);
    }

    setIsRecording(false);
    setAudioURL(null);
  };

  // 페이지 로딩 시 연습문제 가져오기
  useEffect(() => {
    getExample();
  }, []);

  // isNumber가 11이 되면 모달을 표시하도록 설정
  useEffect(() => {
    if (isNumber === 11) {
      setIsNumberMinus();
      setShowModal(true); // 11이 되면 모달을 띄움
    }
  }, [isNumber]); // isNumber가 변경될 때마다 실행

  const closeModal = () => {
    setShowModal(false); // 모달 닫기
    setIsNumberZero();
    finishPost();
    navigate("/training");
  };

    // 틀린 단어를 하이라이트하여 example 텍스트로 변환하는 함수
    const renderHighlightedExample = () => {
      let highlightedText = [];
      let lastIndex = 0;
  
      differences.forEach((diff) => {
        const { operation, answer_position } = diff;
        if (operation === "replace") {
          highlightedText.push(example.slice(lastIndex, answer_position[0]));
          highlightedText.push(
            <span key={answer_position[0]} className="text-red-500 font-bold">
              {example.slice(answer_position[0], answer_position[1])}
            </span>
          );
          lastIndex = answer_position[1];
        }
      });
  
      highlightedText.push(example.slice(lastIndex));
      return highlightedText;
    };

  return (
    <>
      <div className="flex justify-center items-center w-screen">
        <div style={{ width: `${size}rem`, height: `${size}rem` }}>
          {!isRecording && audioURL && (
            <div>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)} // 오디오가 끝나면 상태를 다시 false로 설정
              />
              <VolumeDownIcon
                onClick={handlePlayAudio}
                style={{ cursor: "pointer", color, fontSize: `${size}rem` }}
                className="mb-6"
              />
            </div>
          )}
        </div>

        <div className="text-[#FF8C82] break-words sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center mr-20">
          {/* {example} */}
          {renderHighlightedExample()}
        </div>
      </div>

       {/* 틀린 단어들 출력 */}
       <div className="mt-4 ml-6text-center text-white m:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center mr-20">
        {userStt}
      </div>



      {/* ArrowRight 컴포넌트 */}
      <div className="ml-auto mr-10 flex">
        <ArrowRight onClick={isNext ? getExample : undefined} color="#FF8C82" />
      </div>

      {/* isNumber가 11일 때 FinishModal이 자동으로 표시 */}
      <FinishModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

export default PronounceExample;