<?php

namespace App\Http\Requests;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class ListExecutionsRequest extends FormRequest
{
    public function authorize(): Response
    {
        return Gate::inspect('view', $this->route('agent'));
    }

    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'per_page.between' => 'O tamanho da página deve ficar entre 1 e 100.',
        ];
    }
}
