<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVendeur
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'vendeur') {
            return response()->json([
                'message' => 'Accès réservé aux vendeurs.'
            ], 403);
        }

        if (!$request->user()->is_verified) {
            return response()->json([
                'message' => 'Votre compte vendeur n\'a pas encore été vérifié par un administrateur.'
            ], 403);
        }

        return $next($request);
    }
}
