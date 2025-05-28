import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h1>This is the Home Page!</h1>
      <Button asChild>
        Back to Default
      </Button>
    </div>
  );
}
