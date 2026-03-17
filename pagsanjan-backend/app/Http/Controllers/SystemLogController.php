<?php

namespace App\Http\Controllers;

use App\Models\SystemLog;
use Illuminate\Http\Request;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::with('user')->latest();

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('limit')) {
            $limit = (int) $request->limit;
            $logs = $query->limit($limit)->get();
            return response()->json(['data' => $logs]); // Wrap in data to match pagination structure if needed or just return array
        }

        $logs = $query->paginate(20);
        return response()->json($logs);
    }
}
