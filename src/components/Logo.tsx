export default function Logo({ className = "text-2xl font-bold" }: { className?: string }) {
  return (
    <div className={className}>
      <span className="text-blue-600">Oto</span>
      <span className="text-gray-800">CPAP</span>
      <div className="text-xs text-gray-500 font-normal -mt-1">
        Dönüşüm Medikal
      </div>
    </div>
  );
}