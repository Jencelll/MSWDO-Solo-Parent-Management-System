<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SoloParentCategory;
use App\Models\BenefitQualification;
use App\Models\User;
use App\Models\AdminStaff;
use App\Models\Applicant;
use App\Models\Application;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Categories
        $categories = [
            ['a1', 'Birth of a Child as a consequence of rape'],
            ['a2', 'Widow/widower'],
            ['a3', 'Spouse of person deprived of liberty (PDL)'],
            ['a4', 'Spouse of person with disability (PWD)'],
            ['a5', 'Due to de facto separation'],
            ['a6', 'Due to nullity of marriage'],
            ['a7', 'Abandoned'],
            ['b', 'Spouse of the OFW / Relative of the OFW'],
            ['c', 'Unmarried mother/father who keeps and rears his/her child'],
            ['d', 'Legal guardian, adoptive or foster parent'],
            ['e', 'Any relative within the fourth (4th) degree of consanguinity or affinity'],
            ['f', 'Pregnant woman who provides sole parental care and support'],
        ];

        foreach ($categories as [$code, $description]) {
            SoloParentCategory::firstOrCreate(['code' => $code], ['description' => $description]);
        }

        // Seed Benefit Qualifications
        $benefits = [
            ['A', 'Subsidy, PhilHealth, Prioritization in housing'],
            ['B', '10% Discount and VAT Exemption on selected items'],
        ];

        foreach ($benefits as [$code, $description]) {
            BenefitQualification::firstOrCreate(['code' => $code], ['description' => $description]);
        }

        // Seed Admin User
        AdminStaff::firstOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@pagsanjan.local',
                'password' => Hash::make('password'),
                'full_name' => 'Administrator',
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Seed Mayor User
        AdminStaff::firstOrCreate(
            ['username' => 'mayor'],
            [
                'email' => 'mayor@pagsanjan.gov.ph',
                'password' => Hash::make('mayor123'),
                'full_name' => 'Hon. Mayor',
                'role' => 'mayor',
                'status' => 'active',
            ]
        );

        // Seed Sample Applicants & Applications
        for ($i = 1; $i <= 20; $i++) {
            $applicant = Applicant::create([
                'first_name' => 'Applicant' . $i,
                'middle_name' => 'M',
                'last_name' => 'Test',
                'dob' => now()->subYears(30)->toDateString(),
                'sex' => $i % 2 == 0 ? 'Female' : 'Male',
                'place_of_birth' => 'Pagsanjan, Laguna',
                'address' => $i . ' Sample Street, Pagsanjan',
                'barangay' => ['Pagsanjan', 'Buboy', 'Hinulugang Taktak'][$i % 3],
                'educational_attainment' => 'High School',
                'occupation' => 'Housewife',
                'employment_status' => ['Employed', 'Self-employed', 'Not employed'][$i % 3],
                'monthly_income' => 5000 + ($i * 500),
                'contact_number' => '09' . str_pad($i, 9, '0', STR_PAD_LEFT),
                'is_pantawid_beneficiary' => $i % 3 == 0,
            ]);

            // Create application
            $status = ['Pending', 'Approved', 'Disapproved'][$i % 3];
            $application = Application::create([
                'applicant_id' => $applicant->id,
                'case_number' => 'PSG-' . date('Y') . '-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => $status,
                'category_code' => $i % 2 == 0 ? 'a2' : 'c',
                'benefit_code' => $i % 2 == 0 ? 'A' : 'B',
                'date_applied' => now()->subDays(rand(1, 90))->toDateString(),
                'date_issued' => $status == 'Approved' ? now()->toDateString() : null,
                'expiration_date' => $status == 'Approved' ? now()->addYear()->toDateString() : null,
            ]);

            // Create family members
            for ($j = 0; $j < rand(1, 3); $j++) {
                $applicant->familyMembers()->create([
                    'full_name' => 'Child' . ($j + 1),
                    'relationship' => 'Child',
                    'age' => rand(5, 18),
                    'civil_status' => 'Single',
                ]);
            }

            // Create emergency contact
            $applicant->emergencyContacts()->create([
                'full_name' => 'Emergency Contact',
                'relationship' => 'Relative',
                'address' => '1 Emergency Street',
                'contact_number' => '09' . str_pad($i + 1, 9, '0', STR_PAD_LEFT),
            ]);
        }
    }
}
