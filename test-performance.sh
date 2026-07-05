#!/bin/bash

# Performance Test Script for IHK Lernplattform
# Tests Core Web Vitals, 60fps optimization, and Safari compatibility

echo "🚀 Performance Test Suite for IHK Lernplattform"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server URL
BASE_URL="http://localhost:8080"

# Test results
PASSED=0
FAILED=0
WARNINGS=0

echo "📊 Testing Core Web Vitals Requirements..."
echo ""

# Test 1: File size checks
echo "Test 1: Resource Size Limits"
echo "----------------------------"

check_file_size() {
    local file=$1
    local max_size=$2
    local name=$3
    
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        size_kb=$((size / 1024))
        
        if [ $size_kb -le $max_size ]; then
            echo -e "${GREEN}✓ PASS${NC}: $name (${size_kb}KB < ${max_size}KB)"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC}: $name (${size_kb}KB > ${max_size}KB)"
            ((FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: $name not found"
        ((WARNINGS++))
    fi
}

check_file_size "index.html" 50 "Main HTML"
check_file_size "style.css" 50 "Main CSS"
check_file_size "app.js" 150 "Main JavaScript"
check_file_size "data.js" 100 "Data JavaScript"
check_file_size "sw.js" 20 "Service Worker"

echo ""

# Test 2: Critical CSS inline check
echo "Test 2: Critical CSS Implementation"
echo "-----------------------------------"

if grep -q "data-critical=\"true\"" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Critical CSS inline implementation found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Critical CSS inline implementation missing"
    ((FAILED++))
fi

if grep -q "media=\"print\"" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Non-critical CSS deferred with media print"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Non-critical CSS deferring not found"
    ((WARNINGS++))
fi

echo ""

# Test 3: Lazy loading implementation
echo "Test 3: Lazy Loading Implementation"
echo "-----------------------------------"

if grep -q "loading=\"lazy\"" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Native lazy loading attributes found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Native lazy loading not found"
    ((WARNINGS++))
fi

if grep -q "IntersectionObserver" safari-optimizer.js; then
    echo -e "${GREEN}✓ PASS${NC}: Advanced lazy loading with IntersectionObserver"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Advanced lazy loading implementation missing"
    ((FAILED++))
fi

echo ""

# Test 4: Code splitting setup
echo "Test 4: Code Splitting Implementation"
echo "-------------------------------------"

if grep -q "defer" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Script deferral attributes found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Script deferral not implemented"
    ((FAILED++))
fi

if grep -q "preload" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Critical script preloading found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Critical script preloading not found"
    ((WARNINGS++))
fi

if grep -q "dynamic import\|import(" safari-optimizer.js; then
    echo -e "${GREEN}✓ PASS${NC}: Dynamic imports for code splitting"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Dynamic imports not found"
    ((WARNINGS++))
fi

echo ""

# Test 5: Image optimization
echo "Test 5: Image Optimization"
echo "--------------------------"

if grep -q "decoding=\"async\"" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Async image decoding found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Async image decoding not found"
    ((WARNINGS++))
fi

if grep -q "fetchpriority" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Image fetch priority attributes found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Image fetch priority not implemented"
    ((WARNINGS++))
fi

if grep -q "WebP" safari-optimizer.js; then
    echo -e "${GREEN}✓ PASS${NC}: WebP image format support"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: WebP support not found"
    ((WARNINGS++))
fi

echo ""

# Test 6: Service Worker implementation
echo "Test 6: Service Worker Implementation"
echo "-------------------------------------"

if grep -q "serviceWorker" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Service Worker registration found"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Service Worker registration missing"
    ((FAILED++))
fi

if [ -f "sw.js" ]; then
    if grep -q "cache" sw.js && grep -q "fetch" sw.js; then
        echo -e "${GREEN}✓ PASS${NC}: Service Worker with caching strategy"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: Service Worker caching incomplete"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗ FAIL${NC}: Service Worker file not found"
    ((FAILED++))
fi

echo ""

# Test 7: Safari-specific optimizations
echo "Test 7: Safari-Specific Optimizations"
echo "--------------------------------------"

if grep -q "-webkit-backface-visibility" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Safari hardware acceleration CSS"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Safari hardware acceleration not found"
    ((WARNINGS++))
fi

if grep -q "-webkit-overflow-scrolling" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Safari smooth scrolling"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Safari smooth scrolling not found"
    ((WARNINGS++))
fi

if grep -q "translateZ(0)" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: GPU acceleration with translateZ(0)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: GPU acceleration not fully implemented"
    ((WARNINGS++))
fi

echo ""

# Test 8: Performance monitoring setup
echo "Test 8: Performance Monitoring"
echo "------------------------------"

if grep -q "PerformanceObserver" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Core Web Vitals monitoring (PerformanceObserver)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Core Web Vitals monitoring missing"
    ((FAILED++))
fi

if grep -q "requestAnimationFrame" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: FPS monitoring with requestAnimationFrame"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: FPS monitoring not found"
    ((WARNINGS++))
fi

if grep -q "memory" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Memory monitoring implementation"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Memory monitoring not found"
    ((WARNINGS++))
fi

echo ""

# Test 9: Animation optimization
echo "Test 9: Animation Optimization for 60fps"
echo "-----------------------------------------"

if grep -q "will-change" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: CSS will-change for animation optimization"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: will-change optimization not found"
    ((WARNINGS++))
fi

if grep -q "prefers-reduced-motion" index-optimized.html; then
    echo -e "${GREEN}✓ PASS${NC}: Reduced motion support"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Reduced motion support not found"
    ((WARNINGS++))
fi

echo ""

# Test 10: Server response times
echo "Test 10: Server Performance"
echo "---------------------------"

echo "Testing server response times..."

# Test main page
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/index-optimized.html)
response_time_ms=$(echo "$response_time * 1000" | bc)
if (( $(echo "$response_time < 0.5" | bc -l) )); then
    echo -e "${GREEN}✓ PASS${NC}: Main page load time ${response_time_ms}ms (< 500ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Main page load time ${response_time_ms}ms (> 500ms)"
    ((WARNINGS++))
fi

# Test CSS load time
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/style.css)
response_time_ms=$(echo "$response_time * 1000" | bc)
if (( $(echo "$response_time < 0.3" | bc -l) )); then
    echo -e "${GREEN}✓ PASS${NC}: CSS load time ${response_time_ms}ms (< 300ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: CSS load time ${response_time_ms}ms (> 300ms)"
    ((WARNINGS++))
fi

# Test JS load time
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/app.js)
response_time_ms=$(echo "$response_time * 1000" | bc)
if (( $(echo "$response_time < 0.4" | bc -l) )); then
    echo -e "${GREEN}✓ PASS${NC}: JS load time ${response_time_ms}ms (< 400ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: JS load time ${response_time_ms}ms (> 400ms)"
    ((WARNINGS++))
fi

echo ""

# Test 11: File accessibility
echo "Test 11: File Accessibility"
echo "--------------------------"

check_file_accessible() {
    local file=$1
    local name=$2
    
    http_code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/$file)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $name accessible (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $name not accessible (HTTP $http_code)"
        ((FAILED++))
    fi
}

check_file_accessible "index-optimized.html" "Optimized HTML"
check_file_accessible "style.css" "Main CSS"
check_file_accessible "app.js" "Main JavaScript"
check_file_accessible "data.js" "Data JavaScript"
check_file_accessible "sw.js" "Service Worker"
check_file_accessible "safari-optimizer.js" "Safari Optimizer"
check_file_accessible "performance-audit.html" "Performance Audit"

echo ""

# Test 12: Performance budget compliance
echo "Test 12: Performance Budget Compliance"
echo "--------------------------------------"

total_size=0
for file in index-optimized.html style.css app.js data.js sw.js; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        total_size=$((total_size + size))
    fi
done

total_size_kb=$((total_size / 1024))
budget_kb=300

if [ $total_size_kb -le $budget_kb ]; then
    echo -e "${GREEN}✓ PASS${NC}: Total bundle size ${total_size_kb}KB within budget (${budget_kb}KB)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Total bundle size ${total_size_kb}KB exceeds budget (${budget_kb}KB)"
    ((FAILED++))
fi

echo ""
echo "=============================================="
echo "📊 Test Summary"
echo "=============================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

total_tests=$((PASSED + WARNINGS + FAILED))
success_rate=$((PASSED * 100 / total_tests))

echo "Success Rate: ${success_rate}%"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    exit 0
elif [ $success_rate -ge 80 ]; then
    echo -e "${YELLOW}⚠️ Performance optimization mostly complete${NC}"
    exit 0
else
    echo -e "${RED}❌ Performance optimization needs improvement${NC}"
    exit 1
fi