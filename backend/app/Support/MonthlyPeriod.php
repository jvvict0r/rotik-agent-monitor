<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class MonthlyPeriod
{
    public static function current(): string
    {
        return Carbon::now('UTC')->format('Y-m');
    }
}
