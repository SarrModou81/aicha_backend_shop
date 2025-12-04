<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Liste des adresses de l'utilisateur
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->latest()->get();

        return response()->json([
            'addresses' => $addresses,
        ]);
    }

    /**
     * Créer une nouvelle adresse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100'],
            'is_default' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $address = $request->user()->addresses()->create($request->all());

        return response()->json([
            'message' => 'Adresse créée avec succès.',
            'address' => $address,
        ], 201);
    }

    /**
     * Afficher une adresse
     */
    public function show(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        return response()->json([
            'address' => $address,
        ]);
    }

    /**
     * Mettre à jour une adresse
     */
    public function update(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address_line1' => ['sometimes', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['sometimes', 'string', 'max:100'],
            'is_default' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $address->update($request->all());

        return response()->json([
            'message' => 'Adresse mise à jour avec succès.',
            'address' => $address,
        ]);
    }

    /**
     * Supprimer une adresse
     */
    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json([
            'message' => 'Adresse supprimée avec succès.',
        ]);
    }

    /**
     * Définir une adresse comme adresse par défaut
     */
    public function setDefault(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->update(['is_default' => true]);

        return response()->json([
            'message' => 'Adresse définie comme adresse par défaut.',
            'address' => $address,
        ]);
    }
}
