<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class FileDeletionController extends Controller
{
    public function destroy(Request $request, $type, $id)
    {
        $authUser = Auth::user();

        $mappings = [
            'payslip' => [
                'model' => \App\Models\Payslip::class,
                'path_col' => 'file_path',
                'action' => 'delete_row'
            ],
            'p32' => [
                'model' => \App\Models\PayrollLiability::class,
                'path_col' => 'p32_file_path',
                'file_name_col' => 'p32_filename',
                'action' => 'null_column'
            ],
            'submission_payslip' => [
                'model' => \App\Models\PayrollSubmission::class,
                'path_col' => 'payslip_file_path',
                'file_name_col' => 'payslip_filename',
                'action' => 'null_column'
            ],
            'starter_form' => [
                'model' => \App\Models\StarterForm::class,
                'path_col' => 'file_path',
                'action' => 'delete_row'
            ],
            'p60_p45' => [
                'model' => \App\Models\P60P45::class,
                'path_col' => 'file_path',
                'action' => 'delete_row'
            ],
            'account' => [
                'model' => \App\Models\Account::class,
                'path_col' => 'file_path',
                'action' => 'delete_row'
            ],
            'corporation_tax_ct600' => [
                'model' => \App\Models\CorporationTax::class,
                'path_col' => 'ct600_file',
                'file_name_col' => 'ct600_filename',
                'action' => 'null_column'
            ],
            'corporation_tax_computation' => [
                'model' => \App\Models\CorporationTax::class,
                'path_col' => 'tax_computation_file',
                'file_name_col' => 'tax_computation_filename',
                'action' => 'null_column'
            ],
            'vat_record' => [
                'model' => \App\Models\VatRecord::class,
                'path_col' => 'vat_return_file',
                'file_name_col' => 'vat_return_filename',
                'action' => 'null_column'
            ],
            'self_assessment' => [
                'model' => \App\Models\SelfAssessment::class,
                'path_col' => 'tax_return_file',
                'file_name_col' => 'tax_return_filename',
                'action' => 'null_column'
            ]
        ];

        if ($type === 'ct600_array') {
            $record = \App\Models\CorporationTax::findOrFail($id);
            if ($authUser->role !== 'accountant' && $record->user_id !== $authUser->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $subId = $request->query('sub_id');
            $files = $record->ct600_files ?? [];
            
            $fileToDelete = null;
            $newFiles = [];
            foreach ($files as $f) {
                if ($f['id'] === $subId) {
                    $fileToDelete = $f;
                } else {
                    $newFiles[] = $f;
                }
            }

            if ($fileToDelete) {
                $storagePath = str_replace('/storage/', '', $fileToDelete['path']);
                Storage::disk('public')->delete($storagePath);
                $record->ct600_files = $newFiles;
                $record->save();
                return response()->json(['message' => 'File deleted from array']);
            }
            return response()->json(['error' => 'File not found'], 404);
        }

        if (!isset($mappings[$type])) {
            return response()->json(['error' => 'Invalid file type'], 400);
        }

        $config = $mappings[$type];
        $modelClass = $config['model'];

        $record = $modelClass::findOrFail($id);

        if ($authUser->role !== 'accountant' && $record->user_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filePathCol = $config['path_col'];
        $path = $record->{$filePathCol};

        if ($path) {
            $storagePath = str_replace('/storage/', '', $path);
            Storage::disk('public')->delete($storagePath);
        }

        if ($config['action'] === 'delete_row') {
            $record->delete();
        } else {
            $record->{$filePathCol} = null;
            if (isset($config['file_name_col'])) {
                $record->{$config['file_name_col']} = null;
            }
            $record->save();
        }

        return response()->json(['message' => 'File deleted successfully']);
    }
}
