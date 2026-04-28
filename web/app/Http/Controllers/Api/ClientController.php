<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientCompanyInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    public function store(Request $request)
    {
        $authUser = Auth::user();

        if ($authUser->role !== 'accountant') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'company_number' => 'nullable|string|max:255',
            'auth_code' => 'nullable|string|max:255',
            'ct_reference' => 'nullable|string|max:255',
            'vat_registration' => 'nullable|string|max:255',
            'paye_registration' => 'nullable|string|max:255',
            'accounts_office_ref' => 'nullable|string|max:255',
        ]);

        $password = Str::random(12);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => 'client',
            'setup_completed' => true,
        ]);

        // Create company info if any field is provided
        $companyData = collect($validated)->only([
            'company_number', 'auth_code', 'ct_reference', 
            'vat_registration', 'paye_registration', 'accounts_office_ref'
        ])->filter()->toArray();

        if (!empty($companyData)) {
            ClientCompanyInfo::create(array_merge($companyData, ['user_id' => $user->id]));
        }

        return response()->json([
            'user' => $user,
            'password' => $password,
            'message' => 'Client created successfully'
        ]);
    }

    public function destroy(Request $request, $userId)
    {
        $authUser = Auth::user();

        if ($authUser->role !== 'accountant') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $authUser->password)) {
            return response()->json(['error' => 'Invalid password provided'], 401);
        }

        $client = User::where('id', $userId)->where('role', 'client')->firstOrFail();

        // The related data like documents, messages, etc. should cascade delete
        // based on the database migrations provided.
        $client->delete();

        return response()->json(['message' => 'Client deleted successfully']);
    }
}
