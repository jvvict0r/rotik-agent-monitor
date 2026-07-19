<?php

namespace App\Http\Requests;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreAgentRequest extends FormRequest
{
    public function authorize(): Response
    {
        return Gate::inspect('view', $this->route('client'));
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('agents')->where('client_id', $this->route('client')->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do agente.',
            'name.max' => 'O nome do agente pode ter no máximo 255 caracteres.',
            'name.unique' => 'Já existe um agente com esse nome neste cliente.',
            'description.max' => 'A descrição pode ter no máximo 1000 caracteres.',
        ];
    }
}
