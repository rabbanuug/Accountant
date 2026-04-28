<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentDepositorController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'category' => 'required|string|in:income,expense,bank',
            'file' => 'required|file|max:15360', // 15MB max for high res photos
        ]);

        $authUser = Auth::user();
        $targetUserId = $request->user_id;

        // Security check: only accountant or the user themselves
        if ($authUser->role !== 'accountant' && $authUser->id !== (int)$targetUserId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $file = $request->file('file');
        $category = $request->category;
        
        $type = 'file';
        if ($category === 'income') {
            $type = 'invoice';
        } elseif ($category === 'expense') {
            $type = 'receipt';
        } elseif ($category === 'bank') {
            $type = 'bank_statement';
        }

        $folder = "deposits/{$category}/" . date('Y/m');
        $path = $file->store($folder, 'public');

        $document = Document::create([
            'user_id' => $targetUserId,
            'uploaded_by_id' => $authUser->id,
            'filename' => $file->getClientOriginalName(),
            'filepath' => '/storage/' . $path,
            'type' => $type,
            'category' => $category,
            'status' => 'pending',
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'document_date' => now(),
        ]);

        return response()->json([
            'message' => 'Document deposited successfully',
            'document' => $document
        ]);
    }
}
