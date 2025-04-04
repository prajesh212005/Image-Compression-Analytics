const CompressionSettings = ({ quality, setQuality }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compression Quality: {quality}%
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={quality}
        onChange={(e) => setQuality(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low Quality</span>
        <span>High Quality</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Higher quality means larger file size but better image quality
      </p>
    </div>
  );
};

export default CompressionSettings; 