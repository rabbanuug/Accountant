import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useRef } from 'react';
import axios from 'axios';
import { 
    FolderDown, Receipt, ShoppingCart, Landmark, 
    Upload, Camera, Loader2, CheckCircle2, 
    X, FileText, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Props {
    userId?: number;
    clientName?: string;
}

export default function DocumentDepositor({ userId, clientName }: Props) {
    const { auth } = usePage().props as any;
    const isAccountant = auth.user.role === 'accountant';
    const targetUserId = userId || auth.user.id;

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // File input ref for camera integration
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        {
            id: 'income',
            title: 'Income Depositor',
            description: 'Upload invoices, sales receipts and income proofs',
            icon: Receipt,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            id: 'expense',
            title: 'Expense Depositor',
            description: 'Upload bills, purchase receipts and expenses',
            icon: ShoppingCart,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            id: 'bank',
            title: 'Bank Statements',
            description: 'Upload monthly bank statements and financial records',
            icon: Landmark,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !activeCategory) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('user_id', targetUserId.toString());
        formData.append('category', activeCategory);
        formData.append('file', selectedFile);

        try {
            await axios.post('/api/document-depositor/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploadOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Accounting', href: '/accounting' },
            { title: 'Document Depositor', href: '#' }
        ]}>
            <Head title="Document Depositor" />

            <div className="p-6 max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
                        <FolderDown className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Document Depositor</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
                        Quickly upload or take pictures of your financial documents. They will be categorized and shared with your accountant instantly.
                        {clientName && <span className="block mt-1 text-indigo-600 font-semibold">Client: {clientName}</span>}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Card 
                            key={cat.id} 
                            className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 cursor-pointer overflow-hidden border-2 hover:border-indigo-400 dark:hover:border-indigo-600"
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setIsUploadOpen(true);
                            }}
                        >
                            <CardHeader className={`${cat.bg} border-b border-slate-100 dark:border-slate-800 transition-colors`}>
                                <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform`}>
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <CardTitle className="text-xl font-bold">{cat.title}</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400 leading-tight">
                                    {cat.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 flex items-center justify-center">
                                <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Upload Document
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                        <Camera className="w-6 h-6 text-slate-400" />
                        <h2 className="text-lg font-semibold">Mobile Tip</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Using your mobile device? Clicking "Upload" will allow you to use your camera to take a clear, high-quality picture of your paper documents directly.
                    </p>
                </div>
            </div>

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={(open) => {
                setIsUploadOpen(open);
                if (!open) {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeCategory && (() => {
                                const cat = categories.find(c => c.id === activeCategory);
                                const Icon = cat?.icon || FolderDown;
                                return <><Icon className={`w-5 h-5 ${cat?.color}`} /> {cat?.title}</>;
                            })()}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-6 flex flex-col items-center justify-center gap-4">
                        {!selectedFile ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload or take a photo</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        ) : (
                            <div className="w-full relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-[300px]" />
                                ) : (
                                    <div className="p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800">
                                        <FileText className="w-16 h-16 text-indigo-500 mb-2" />
                                        <p className="font-semibold text-center truncate w-full px-4">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                )}
                                <button 
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*,.pdf" 
                            capture="environment" // Hint for mobile camera
                            onChange={handleFileSelect}
                        />
                    </div>

                    <DialogFooter>
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-500/20"
                            disabled={!selectedFile || isUploading}
                            onClick={handleUpload}
                        >
                            {isUploading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5 mr-2" /> Submit Document</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    )
}
