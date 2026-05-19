import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/")}
            className="rounded-lg"
            size="lg"
          >
            <Home className="h-5 w-5 ml-2" />
            العودة للرئيسية
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/search")}
            className="rounded-lg"
            size="lg"
          >
            <Search className="h-5 w-5 ml-2" />
            البحث
          </Button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3 text-sm">روابط مفيدة</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => navigate("/")}
              className="block w-full text-right hover:text-primary transition-colors"
            >
              • الصفحة الرئيسية
            </button>
            <button
              onClick={() => navigate("/questions/new")}
              className="block w-full text-right hover:text-primary transition-colors"
            >
              • اطرح سؤالاً جديداً
            </button>
            <button
              onClick={() => navigate("/profile/me")}
              className="block w-full text-right hover:text-primary transition-colors"
            >
              • ملفي الشخصي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
