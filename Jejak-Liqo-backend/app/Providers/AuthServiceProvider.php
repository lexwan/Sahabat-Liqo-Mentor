<?php

namespace App\Providers;
// App\Providers\AuthServiceProvider.php
// Impor model dan fasad yang dibutuhkan
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Daftarkan Gate untuk memeriksa peran admin
        Gate::define('is_admin', function (User $user) {
            return $user->isAdmin();
        });
    }
}