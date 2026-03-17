<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

use Illuminate\Support\Facades\DB;

class PhotoUploadTest extends TestCase
{
    // ...

    protected function setUp(): void
    {
        parent::setUp();
        Artisan::call('migrate');
        
        // Seed required data for foreign keys
        DB::table('solo_parent_categories')->insert([
            'code' => 'A1',
            'description' => 'Test Category'
        ]);
        
        DB::table('benefit_qualifications')->insert([
            'code' => 'B',
            'description' => 'Test Benefit'
        ]);
    }

    public function test_photo_is_persisted_to_registry_and_id_card_record()
    {
        Storage::fake('public');

        // Create a user for authentication
        $user = User::create([
            'username' => 'testuser',
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create an applicant (Registry)
        $applicant = Applicant::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'age' => 30,
            'sex' => 'Male',
            'place_of_birth' => 'Test City',
            'address' => 'Test Address',
            'barangay' => 'Test Barangay',
            'civil_status' => 'Single',
            'educational_attainment' => 'College',
            'occupation' => 'None',
            'monthly_income' => 0,
            'contact_number' => '09123456789',
        ]);

        // Create an application (ID Card Record)
        $application = Application::create([
            'applicant_id' => $applicant->id,
            'case_number' => 'CASE-123',
            'status' => 'Pending',
            'created_by' => $user->id,
            'category_code' => 'A1',
            'benefit_code' => 'B',
            'date_applied' => now(),
        ]);

        // Mock a photo file
        $file = UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        // Perform the upload request
        $response = $this->actingAs($user)
            ->postJson("/api/applicants/{$applicant->id}/photo", [
                'photo' => $file,
            ]);

        // Assert response success
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'applicant_id' => $applicant->id,
                'application_id' => $application->id,
            ]);

        // Verify file was stored
        $responseData = $response->json();
        $photoPath = str_replace('/storage/', '', $responseData['photo_path']);
        Storage::disk('public')->assertExists($photoPath);

        // Verify Registry (Applicant) has the photo path
        $this->assertDatabaseHas('applicants', [
            'id' => $applicant->id,
            'photo_path' => $responseData['photo_path'],
        ]);

        // Verify ID Card Record (Application) has the photo path
        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'photo_path' => $responseData['photo_path'],
        ]);
    }
}
