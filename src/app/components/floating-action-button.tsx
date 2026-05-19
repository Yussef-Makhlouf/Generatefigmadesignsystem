import { Link } from "react-router";
import { Button } from "./ui/button";
import { PenSquare } from "lucide-react";

export function FloatingActionButton() {
  return (
    <Button
      asChild
      size="lg"
      className="fixed bottom-20 left-4 md:hidden rounded-full h-14 w-14 shadow-lg z-40 p-0"
    >
      <Link to="/questions/new">
        <PenSquare className="h-6 w-6" />
        <span className="sr-only">اطرح سؤالاً</span>
      </Link>
    </Button>
  );
}
