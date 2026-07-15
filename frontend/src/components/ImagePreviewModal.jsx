import { MdClose, MdDownload } from "react-icons/md";
import { downloadImage } from "../services/messageService";

const ImagePreviewModal = ({ image, fileName, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    downloadImage(image, fileName);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        className="absolute top-3 left-4 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg backdrop-blur-md transition cursor-pointer text-xs font-semibold border border-white/10 shadow-sm z-10"
      >
        <MdDownload size={16} />
        Download
      </button>

      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg backdrop-blur-md transition cursor-pointer border border-white/10 shadow-sm z-10"
      >
        <MdClose size={18} />
      </button>

      <img
        src={image}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[82vh] rounded-xl shadow-2xl object-contain ring-1 ring-white/10 select-none animate-in fade-in zoom-in-95 duration-150"
      />
    </div>
  );
};

export default ImagePreviewModal;