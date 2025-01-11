import { useConvexAuth } from "convex/react";
import Link from "next/link";
import Image from "next/image";
import LogoImage from "./logo.png"; // Adjust the path as needed

export default function Logo() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="flex items-center justify-start">
      <Link href={isAuthenticated ? "/dashboard" : "/"}>
        <div className="flex justify-center items-center transform md:scale-125 scale-100">
          <Image src={LogoImage} alt="VetVault" width={150} height={150} />
        </div>
      </Link>
    </div>
  );
}
