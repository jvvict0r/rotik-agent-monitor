<?php

namespace App\Http\Requests;

use App\Enums\ExecutionStatus;
use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreExecutionRequest extends FormRequest
{
    public function authorize(): Response
    {
        return Gate::inspect('view', $this->route('agent'));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ExecutionStatus::class)],
            'duration_ms' => ['nullable', 'integer', 'min:0', 'max:3600000'],
            'error_message' => ['nullable', 'string', 'max:1000', 'prohibited_if:status,success'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Informe o status da execução.',
            'status.Illuminate\Validation\Rules\Enum' => 'O status deve ser success ou failed.',
            'duration_ms.integer' => 'A duração deve ser um número inteiro de milissegundos.',
            'duration_ms.min' => 'A duração não pode ser negativa.',
            'duration_ms.max' => 'A duração não pode passar de uma hora.',
            'error_message.max' => 'A mensagem de erro pode ter no máximo 1000 caracteres.',
            'error_message.prohibited_if' => 'Execução com sucesso não deve ter mensagem de erro.',
        ];
    }
}
