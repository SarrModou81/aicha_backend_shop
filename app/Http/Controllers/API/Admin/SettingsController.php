<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\DeliveryZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Obtenir tous les paramètres système
     */
    public function index()
    {
        $settings = SystemSetting::all();

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Mettre à jour un paramètre
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => ['required', 'string'],
            'value' => ['required'],
            'type' => ['required', 'in:string,number,boolean,json'],
            'description' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $setting = SystemSetting::set(
            $request->key,
            $request->value,
            $request->type,
            $request->description
        );

        return response()->json([
            'message' => 'Paramètre mis à jour avec succès.',
            'setting' => $setting,
        ]);
    }

    /**
     * Zones de livraison
     */
    public function deliveryZones()
    {
        $zones = DeliveryZone::all();

        return response()->json([
            'zones' => $zones,
        ]);
    }

    /**
     * Créer une zone de livraison
     */
    public function createDeliveryZone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'estimated_days' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $zone = DeliveryZone::create($request->all());

        return response()->json([
            'message' => 'Zone de livraison créée avec succès.',
            'zone' => $zone,
        ], 201);
    }

    /**
     * Mettre à jour une zone de livraison
     */
    public function updateDeliveryZone(Request $request, $id)
    {
        $zone = DeliveryZone::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'shipping_cost' => ['sometimes', 'numeric', 'min:0'],
            'estimated_days' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $zone->update($request->all());

        return response()->json([
            'message' => 'Zone de livraison mise à jour avec succès.',
            'zone' => $zone,
        ]);
    }

    /**
     * Supprimer une zone de livraison
     */
    public function deleteDeliveryZone($id)
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone->delete();

        return response()->json([
            'message' => 'Zone de livraison supprimée avec succès.',
        ]);
    }
}
