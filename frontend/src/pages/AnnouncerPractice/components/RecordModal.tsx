import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface RecordModalProps {
  isOpen: boolean; // 모달이 열려 있는지 확인하는 상태를 부모로부터 전달받음
  onClose: () => void; // 모달 닫을 때 호출되는 함수
  onReset: () => void;
}

export default function RecordModal({
  isOpen,
  onClose,
  onReset,
}: RecordModalProps) {
  const handleClose = (_: React.SyntheticEvent, reason: string) => {
    if (reason !== "backdropClick") {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        "& .MuiPaper-root": {
          // Dialog의 기본 Paper에 대한 스타일링
          backgroundColor: "#F3F3F3", // 원하는 색상으로 변경
          color: "#333", // 텍스트 색상도 필요시 변경
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">연습이 완료되었습니다!</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          아나운서 따라하기 녹음본을 제출하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onReset}
          sx={{ color: "#EC5A4D" }}
          aria-label="재녹음 하기"
        >
          재녹음 하기
        </Button>
        <Button
          onClick={onClose}
          sx={{ color: "#EC5A4D" }}
          aria-label="녹음본 제출하기"
        >
          제출하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
