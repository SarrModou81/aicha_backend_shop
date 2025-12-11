<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Liste tous les utilisateurs
     */
    public function index(Request $request)
    {
        $role = $request->get('role');
        $status = $request->get('status');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($request->has('verified')) {
            $query->where('is_verified', $request->verified);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('shop_name', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    /**
     * Créer un nouveau vendeur
     */
    public function createSeller(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'shop_name' => ['required', 'string', 'max:255'],
            'shop_description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'vendeur',
            'shop_name' => $request->shop_name,
            'shop_description' => $request->shop_description,
            'is_active' => true,
            'is_verified' => true, // Directement vérifié par l'admin
        ]);

        return response()->json([
            'message' => 'Vendeur créé avec succès.',
            'user' => $user,
        ], 201);
    }

    /**
     * Afficher un utilisateur
     */
    public function show($id)
    {
        $user = User::with(['products', 'orders'])->findOrFail($id);

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'shop_name' => ['sometimes', 'string', 'max:255'],
            'shop_description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'is_verified' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->all());

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Désactiver un compte utilisateur
     */
    public function deactivate(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Impossible de désactiver un compte administrateur.',
            ], 403);
        }

        $user->update(['is_active' => false]);

        // Révoquer tous les tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Compte désactivé avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Activer un compte utilisateur
     */
    public function activate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => true]);

        return response()->json([
            'message' => 'Compte activé avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Valider un compte vendeur
     */
    public function verifySeller($id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'vendeur') {
            return response()->json([
                'message' => 'Cet utilisateur n\'est pas un vendeur.',
            ], 400);
        }

        $user->update(['is_verified' => true]);

        // TODO: Envoyer une notification au vendeur

        return response()->json([
            'message' => 'Vendeur vérifié avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Réinitialiser le mot de passe d'un utilisateur
     */
    public function resetPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Révoquer tous les tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    /**
     * Vendeurs en attente de validation
     */
    public function pendingVendors()
    {
        $vendors = User::vendeurs()
            ->where('is_verified', false)
            ->latest()
            ->paginate(15);

        return response()->json($vendors);
    }

    /**
     * Liste tous les vendeurs avec leurs statistiques
     */
    public function sellers(Request $request)
    {
        $query = User::where('role', 'vendeur')
            ->withCount('products');

        if ($request->has('verified')) {
            $query->where('is_verified', $request->verified);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->active);
        }

        $sellers = $query->latest()->get();

        return response()->json($sellers);
    }

    /**
     * Approuver un vendeur
     */
    public function approveSeller($id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'vendeur') {
            return response()->json([
                'message' => 'Cet utilisateur n\'est pas un vendeur.',
            ], 400);
        }

        $user->update([
            'is_verified' => true,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Vendeur approuvé avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Désapprouver un vendeur
     */
    public function disapproveSeller($id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'vendeur') {
            return response()->json([
                'message' => 'Cet utilisateur n\'est pas un vendeur.',
            ], 400);
        }

        $user->update([
            'is_verified' => false,
        ]);

        return response()->json([
            'message' => 'Vendeur désapprouvé avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Suspendre un vendeur
     */
    public function suspendSeller(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'vendeur') {
            return response()->json([
                'message' => 'Cet utilisateur n\'est pas un vendeur.',
            ], 400);
        }

        $user->update(['is_active' => false]);

        // Révoquer tous les tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Vendeur suspendu avec succès.',
            'user' => $user,
        ]);
    }
}
