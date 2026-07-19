<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        $items = Inventory::orderBy('expiry_date', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => 'required|string',
            'expiry_date' => 'required|date',
            'category' => 'required|string'
        ]);

        $name = trim($request->name);
        
        // Find existing item case-insensitively
        $existingItem = Inventory::whereRaw('LOWER(TRIM(name)) = ?', [strtolower($name)])->first();

        if ($existingItem) {
            $existingItem->quantity += $request->quantity;
            
            // Keep the earliest expiry date
            if ($request->expiry_date < $existingItem->expiry_date) {
                $existingItem->expiry_date = $request->expiry_date;
            }
            
            // Update category and unit in case they changed
            $existingItem->category = $request->category;
            $existingItem->unit = $request->unit;
            $existingItem->save();
            
            $item = $existingItem;
        } else {
            $item = Inventory::create([
                'name' => $name,
                'quantity' => $request->quantity,
                'unit' => $request->unit,
                'expiry_date' => $request->expiry_date,
                'category' => $request->category
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil ditambahkan ke kulkas.',
            'data' => $item
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'quantity' => 'sometimes|numeric|min:0',
            'unit' => 'sometimes|string',
            'expiry_date' => 'sometimes|date',
            'category' => 'sometimes|string'
        ]);

        $item->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil diperbarui.',
            'data' => $item
        ]);
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil dikeluarkan dari kulkas.'
        ]);
    }
}
