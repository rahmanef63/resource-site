"use client";

import { useState, useEffect } from "react";
import { useBackend } from "../../shared/hooks/useBackend";
import { MessageCircle, Send } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: number;
  postId: number;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: number;
  approved: boolean;
}

interface CommentsProps {
  postId: number;
}

export function Comments({ postId }: CommentsProps) {
  const { locale } = useLanguage();
  const { toast } = useToast();
  const backend = useBackend();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });

  useEffect(() => {
    loadComments();
  }, [postId, backend]);

  const loadComments = async () => {
    try {
      const res = await backend.comments.list({ postId });
      setComments(res.comments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.authorName || !formData.authorEmail || !formData.content) {
      toast({
        title: locale === "id" ? "Mohon isi semua field" : locale === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await backend.comments.create({
        postId,
        ...formData,
      });
      
      setFormData({ authorName: "", authorEmail: "", content: "" });
      await loadComments();
      
      toast({
        title: locale === "id" ? "Komentar berhasil ditambahkan" : locale === "ar" ? "تمت إضافة التعليق بنجاح" : "Comment added successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to submit comment:", error);
      toast({
        title: locale === "id" ? "Gagal menambahkan komentar" : locale === "ar" ? "فشل إضافة التعليق" : "Failed to add comment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      comments: { id: "Komentar", en: "Comments", ar: "التعليقات" },
      noComments: { id: "Belum ada komentar. Jadilah yang pertama!", en: "No comments yet. Be the first!", ar: "لا توجد تعليقات حتى الآن. كن الأول!" },
      leaveComment: { id: "Tinggalkan Komentar", en: "Leave a Comment", ar: "اترك تعليق" },
      name: { id: "Nama", en: "Name", ar: "الاسم" },
      email: { id: "Email", en: "Email", ar: "البريد الإلكتروني" },
      comment: { id: "Komentar", en: "Comment", ar: "التعليق" },
      submit: { id: "Kirim", en: "Submit", ar: "إرسال" },
    };
    return labels[key]?.[locale] || labels[key]?.en || key;
  };

  return (
    <div className="border-t pt-8 mt-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        {getLabel("comments")} ({comments.length})
      </h3>

      {loading ? (
        <p className="text-foreground/60">{locale === "id" ? "Memuat..." : locale === "ar" ? "جار التحميل..." : "Loading..."}</p>
      ) : comments.length === 0 ? (
        <p className="text-foreground/60 mb-8">{getLabel("noComments")}</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-semibold">{comment.authorName}</span>
                <span className="text-sm text-foreground/60">
                  {new Date(comment.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
              <p className="text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-muted/30 p-6 rounded-lg">
        <h4 className="text-xl font-semibold mb-4">{getLabel("leaveComment")}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {getLabel("name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {getLabel("email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.authorEmail}
                onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={submitting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {getLabel("comment")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting 
              ? (locale === "id" ? "Mengirim..." : locale === "ar" ? "جارٍ الإرسال..." : "Submitting...")
              : getLabel("submit")
            }
          </button>
        </form>
      </div>
    </div>
  );
}


