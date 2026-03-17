<table>
    <!-- Header -->
    <!-- Row 1 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-weight: bold; font-size: 11pt; vertical-align: middle;">Republic of the Philippines</td>
        <td colspan="2"></td>
    </tr>
    <!-- Row 2 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-weight: bold; font-size: 11pt; vertical-align: middle;">Municipality of Pagsanjan, Province of Laguna</td>
        <td colspan="2"></td>
    </tr>
    <!-- Row 3 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-weight: bold; font-size: 12pt; vertical-align: middle;">MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE (MSWDO)</td>
        <td colspan="2"></td>
    </tr>
    <!-- Row 4 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-weight: bold; font-size: 14pt; vertical-align: middle;">SOLO PARENT STATISTICAL REPORT</td>
        <td colspan="2"></td>
    </tr>
    <!-- Row 5 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-weight: bold; font-size: 11pt; vertical-align: middle;">Barangay: {{ $barangay }}</td>
        <td colspan="2"></td>
    </tr>
    <!-- Row 6 -->
    <tr>
        <td colspan="2"></td>
        <td colspan="13" style="text-align: center; font-size: 10pt; font-weight: normal; vertical-align: middle;">Reporting Period: Cumulative | Date Generated: {{ date('F d, Y') }}</td>
        <td colspan="2"></td>
    </tr>
    
    <tr><td colspan="17" style="height: 20px;"></td></tr>

    <!-- I. Registered Per Month -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">I. SOLO PARENTS REGISTERED PER MONTH</td></tr>
    <tr>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Month</td>
        @foreach(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as $m)
            <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">{{ $m }}</td>
        @endforeach
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Total</td>
        <td colspan="3"></td>
    </tr>
    <tr>
        <td style="border: 1px solid black;">Count</td>
        @php $total = 0; @endphp
        @for($i = 1; $i <= 12; $i++)
            @php $count = $monthlyData[$i] ?? 0; $total += $count; @endphp
            <td style="border: 1px solid black; text-align: center;">{{ $count }}</td>
        @endfor
        <td style="border: 1px solid black; text-align: center;">{{ $total }}</td>
        <td colspan="3"></td>
    </tr>
    <tr><td colspan="17" style="height: 15px;"></td></tr>

    <!-- II. Gender Distribution -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">II. GENDER DISTRIBUTION</td></tr>
    <tr>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Gender</td>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Count</td>
        <td colspan="15"></td>
    </tr>
    @foreach(['Male', 'Female'] as $gender)
        <tr>
            <td style="border: 1px solid black;">{{ $gender }}</td>
            <td style="border: 1px solid black; text-align: center;">{{ $genderData[$gender] ?? 0 }}</td>
            <td colspan="15"></td>
        </tr>
    @endforeach
    <tr><td colspan="17" style="height: 15px;"></td></tr>

    <!-- III. Age Range Distribution -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">III. AGE RANGE DISTRIBUTION</td></tr>
    <tr>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Age Range</td>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Count</td>
        <td colspan="15"></td>
    </tr>
    @foreach($ageData as $label => $count)
        <tr>
            <td style="border: 1px solid black;">{{ $label }}</td>
            <td style="border: 1px solid black; text-align: center;">{{ $count }}</td>
            <td colspan="15"></td>
        </tr>
    @endforeach
    <tr><td colspan="17" style="height: 15px;"></td></tr>

    <!-- IV. Applications by Status -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">IV. APPLICATIONS BY STATUS</td></tr>
    <tr>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Status</td>
        <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black;">Count</td>
        <td colspan="15"></td>
    </tr>
    @foreach(['Approved', 'Pending', 'Disapproved'] as $status)
        <tr>
            <td style="border: 1px solid black;">{{ $status }}</td>
            <td style="border: 1px solid black; text-align: center;">{{ $statusData[$status] ?? 0 }}</td>
            <td colspan="15"></td>
        </tr>
    @endforeach
    <tr><td colspan="17" style="height: 15px;"></td></tr>

    <!-- V. Barangay Summary -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">V. BARANGAY SUMMARY</td></tr>
    @foreach($summaryData as $desc => $count)
        <tr>
            <td style="border: 1px solid black;">{{ $desc }}</td>
            <td style="border: 1px solid black; text-align: center;">{{ $count }}</td>
            <td colspan="15"></td>
        </tr>
    @endforeach
    <tr><td colspan="17" style="height: 15px;"></td></tr>

    <!-- VI. Masterlist -->
    <tr><td colspan="17" style="background-color: #336699; color: white; font-weight: bold;">VI. MASTERLIST (PER BARANGAY)</td></tr>
    <tr>
        @foreach(['SORT SEQ', 'FULL NAME', 'LAST NAME', 'FIRST NAME', 'MIDDLE NAME', 'EXT', 'ADDRESS', 'BARANGAY', 'GENDER', 'DATE OF BIRTH', 'MONTH', 'DAY', 'YEAR', 'AGE', 'CONTACT NUMBER', 'OSCA ID NO', 'RRN NO', 'HOUSE OWNERSHIP STATUS', 'HOUSE CONDITION'] as $h)
            <td style="background-color: #C0C0C0; font-weight: bold; border: 1px solid black; font-size: 9pt;">{{ $h }}</td>
        @endforeach
    </tr>
    @php $seq = 1; @endphp
    @foreach($applicants as $app)
        @php
            $dob = $app->dob ? \Carbon\Carbon::parse($app->dob) : null;
            $fullName = "{$app->last_name}, {$app->first_name} " . ($app->middle_name ? $app->middle_name[0] . '.' : '');
        @endphp
        <tr>
            <td style="border: 1px solid black; text-align: center;">{{ $seq++ }}</td>
            <td style="border: 1px solid black;">{{ $fullName }}</td>
            <td style="border: 1px solid black;">{{ $app->last_name }}</td>
            <td style="border: 1px solid black;">{{ $app->first_name }}</td>
            <td style="border: 1px solid black;">{{ $app->middle_name }}</td>
            <td style="border: 1px solid black;">{{ $app->extension_name }}</td>
            <td style="border: 1px solid black;">{{ $app->address }}</td>
            <td style="border: 1px solid black;">{{ $app->barangay }}</td>
            <td style="border: 1px solid black;">{{ $app->sex }}</td>
            <td style="border: 1px solid black;">{{ $dob ? $dob->format('m/d/Y') : '' }}</td>
            <td style="border: 1px solid black;">{{ $dob ? $dob->month : '' }}</td>
            <td style="border: 1px solid black;">{{ $dob ? $dob->day : '' }}</td>
            <td style="border: 1px solid black;">{{ $dob ? $dob->year : '' }}</td>
            <td style="border: 1px solid black;">{{ $app->age }}</td>
            <td style="border: 1px solid black;" data-format="@">{{ $app->contact_number }}</td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;">{{ $app->house_ownership_status }}</td>
            <td style="border: 1px solid black;">{{ $app->house_condition }}</td>
        </tr>
    @endforeach
</table>
