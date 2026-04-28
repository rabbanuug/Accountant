<?php

namespace App\Http\Controllers;

use App\Models\SupportRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function index()
    {
        return Inertia::render('support');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        SupportRequest::create($validated);

        return back()->with('success', 'Your support request has been sent successfully.');
    }

    public function adminIndex()
    {
        if (auth()->user()->role !== 'accountant') {
            abort(403);
        }

        $requests = SupportRequest::latest()->get();

        return Inertia::render('support-requests', [
            'requests' => $requests
        ]);
    }
}
