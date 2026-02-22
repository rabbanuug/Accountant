<?php

$url = "http://127.0.0.1:8000/api";
$concurrentRequests = 50; // Batch size
$totalRequests = 500;
$reportFile = 'reports/load-test-report.json';

// Ensure report directory exists
if (!is_dir(dirname($reportFile))) {
    mkdir(dirname($reportFile), 0777, true);
}

echo "Starting load test for $totalRequests requests with concurrency $concurrentRequests...\n";

$mh = curl_multi_init();
$handles = [];
$results = [];

$startTime = microtime(true);

// Function to create a request
function createHandle($index) {
    global $url;
    $ch = curl_init();
    $email = "client" . rand(1, 500) . "@test.com"; // Predictable seeded user
    
    // Login to get token first (simulated for simplicity, or we can just hit public endpoint if blocked)
    // Actually, logging in 500 times is heavy. Let's just hit a public endpoint or try one login and reuse token?
    // User wants "lots of data". Let's try to hit /api/user with a fixed valid token if possible, or just login.
    // Let's simulate login for realism.
    
    $postData = json_encode(['email' => $email, 'password' => 'password']);
    
    curl_setopt($ch, CURLOPT_URL, "$url/login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10s timeout
    
    return $ch;
}

$active = 0;
$completed = 0;

// Start initial batch
for ($i = 0; $i < $concurrentRequests; $i++) {
    $ch = createHandle($i);
    curl_multi_add_handle($mh, $ch);
    $handles[$i] = $ch;
}

do {
    $status = curl_multi_exec($mh, $active);
    if ($active) {
        curl_multi_select($mh);
    }
    
    // Check for completed requests
    while (($info = curl_multi_info_read($mh)) !== false) {
        $ch = $info['handle'];
        $content = curl_multi_getcontent($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
        
        $results[] = [
            'http_code' => $httpCode,
            'time' => $totalTime,
            'success' => $httpCode === 200,
        ];
        
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
        $completed++;
        
        // Add new request if needed
        if ($completed + count($handles) <= $totalRequests) {
            // Find key of removed handle
            $key = array_search($ch, $handles);
            unset($handles[$key]);
             // Add next
             $chNew = createHandle($completed + count($handles));
             curl_multi_add_handle($mh, $chNew);
             $handles[] = $chNew;
        }
        
        echo "\rCompleted: $completed / $totalRequests";
    }
} while ($active && $status == CURLM_OK);

$endTime = microtime(true);
$duration = $endTime - $startTime;

echo "\nLoad test finished in " . round($duration, 2) . " seconds.\n";

// Analyze results
$succcessCount = count(array_filter($results, fn($r) => $r['success']));
$totalTimeSum = array_sum(array_column($results, 'time'));
$avgTime = $totalTimeSum / count($results);
$maxTime = max(array_column($results, 'time'));

$report = [
    'aggregate' => [
        'timestamp' => date('c'),
        'scenariosCreated' => $totalRequests,
        'scenariosCompleted' => $completed,
        'requestsCompleted' => $completed,
        'latency' => [
            'min' => min(array_column($results, 'time')) * 1000,
            'max' => $maxTime * 1000,
            'median' => $avgTime * 1000, // Approximation
            'p95' => $maxTime * 1000, // Approximation
            'p99' => $maxTime * 1000, // Approximation
        ],
        'rps' => [
            'count' => $totalRequests,
            'mean' => $totalRequests / $duration,
        ],
        'codes' => array_count_values(array_column($results, 'http_code')),
        'errors' => $totalRequests - $succcessCount,
    ]
];

file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT));
echo "Report saved to $reportFile\n";
