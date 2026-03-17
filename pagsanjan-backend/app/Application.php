<?php

namespace App;

use Illuminate\Foundation\Application as BaseApplication;

class Application extends BaseApplication
{
    protected $basePath;

    public function __construct($basePath = null)
    {
        parent::__construct($basePath);
    }
}
