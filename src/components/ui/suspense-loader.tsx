import KoajoIcon from "../../../public/koajo.png";

export default function SuspenseLoader() {
  return (
    <div className="h-screen items-center justify-center bg-sidebar flex text-center">
      <img
        src={KoajoIcon}
        alt="Koajo Icon"
        className="h-48 w-48 animate-pulse"
      />
    </div>
  );
}
