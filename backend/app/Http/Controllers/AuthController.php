<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'weight' => 'sometimes|integer',
            'height' => 'sometimes|integer',
            'age' => 'sometimes|integer',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'target_calories' => 2000,
            'target_carbs' => 250,
            'target_protein' => 75,
            'target_fat' => 65,
            'weight' => $request->weight ?? 60,
            'height' => $request->height ?? 165,
            'age' => $request->age ?? 25,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    }

    public function getProfile(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'sometimes|string',
            'target_calories' => 'sometimes|integer|min:0',
            'target_carbs' => 'sometimes|integer|min:0',
            'target_protein' => 'sometimes|integer|min:0',
            'target_fat' => 'sometimes|integer|min:0',
            'weight' => 'sometimes|integer|min:0',
            'height' => 'sometimes|integer|min:0',
            'age' => 'sometimes|integer|min:0',
        ]);

        $user->update($request->only([
            'name', 'target_calories', 'target_carbs', 'target_protein', 'target_fat', 'weight', 'height', 'age'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user
        ]);
    }
}
