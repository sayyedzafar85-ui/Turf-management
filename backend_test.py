import requests
import sys
from datetime import datetime, date
import json

class TurfManagementAPITester:
    def __init__(self, base_url="https://sportslots-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.super_admin_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, params=params)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_super_admin_login(self):
        """Test super admin login"""
        success, response = self.run_test(
            "Super Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "superadmin", "password": "Admin@123"}
        )
        if success and 'access_token' in response:
            self.super_admin_token = response['access_token']
            print(f"   Token obtained: {self.super_admin_token[:20]}...")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST", 
            "auth/login",
            200,
            data={"username": "greenfield", "password": "Pass@123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_super_admin_dashboard(self):
        """Test super admin dashboard"""
        if not self.super_admin_token:
            print("❌ Skipping - No super admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.super_admin_token}'}
        success, response = self.run_test(
            "Super Admin Dashboard",
            "GET",
            "dashboard/super-admin",
            200,
            headers=headers
        )
        
        if success:
            print(f"   Total Turfs: {response.get('total_turfs', 0)}")
            print(f"   Total Revenue: ₹{response.get('total_revenue', 0)}")
        return success

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Dashboard",
            "GET",
            "dashboard/admin",
            200,
            headers=headers
        )
        
        if success:
            print(f"   Today's Bookings: {response.get('today_bookings_count', 0)}")
            print(f"   Today's Income: ₹{response.get('today_income', 0)}")
            print(f"   Pending Payments: {response.get('pending_payments_count', 0)}")
        return success

    def test_create_admin(self):
        """Test creating new admin"""
        if not self.super_admin_token:
            print("❌ Skipping - No super admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.super_admin_token}'}
        timestamp = datetime.now().strftime("%H%M%S")
        
        success, response = self.run_test(
            "Create New Admin",
            "POST",
            "auth/create-user",
            200,
            data={
                "username": f"testadmin{timestamp}",
                "mobile": f"98765{timestamp}",
                "turf_name": f"Test Turf {timestamp}",
                "temporary_password": "TempPass123!",
                "role": "admin"
            },
            headers=headers
        )
        return success

    def test_turf_settings(self):
        """Test turf settings save and retrieve"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test save settings
        success, _ = self.run_test(
            "Save Turf Settings",
            "POST",
            "settings/turf",
            200,
            data={
                "turf_name": "GreenField Sports Arena",
                "open_time": "06:00",
                "close_time": "23:00",
                "slot_duration": 60,
                "weekday_price": 1000,
                "weekend_price": 1500,
                "advance_required": 0,
                "cancellation_policy": "No refund"
            },
            headers=headers
        )
        
        if not success:
            return False
            
        # Test get settings
        success, response = self.run_test(
            "Get Turf Settings",
            "GET",
            "settings/turf",
            200,
            headers=headers
        )
        
        if success:
            print(f"   Turf Name: {response.get('turf_name', 'N/A')}")
            print(f"   Operating Hours: {response.get('open_time', 'N/A')} - {response.get('close_time', 'N/A')}")
        return success

    def test_available_slots(self):
        """Test available slots API"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        today = date.today().isoformat()
        
        success, response = self.run_test(
            "Get Available Slots",
            "GET",
            "slots/available",
            200,
            headers=headers,
            params={"date": today}
        )
        
        if success:
            slots = response.get('slots', [])
            available_count = len([s for s in slots if s.get('available')])
            print(f"   Total Slots: {len(slots)}")
            print(f"   Available: {available_count}")
        return success

    def test_create_booking(self):
        """Test booking creation"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        today = date.today().isoformat()
        timestamp = datetime.now().strftime("%H%M%S")
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data={
                "date": today,
                "slot_time": "20:00",  # Using evening slot to avoid conflicts
                "customer_name": f"Test Customer {timestamp}",
                "customer_mobile": f"9876543{timestamp[-3:]}",
                "total_amount": 1000,
                "advance_paid": 500,
                "payment_mode": "UPI"
            },
            headers=headers
        )
        return success

    def test_pending_payments(self):
        """Test pending payments API"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        success, response = self.run_test(
            "Get Pending Payments",
            "GET",
            "payments/pending",
            200,
            headers=headers
        )
        
        if success:
            pending = response.get('pending_payments', [])
            print(f"   Pending Payments: {len(pending)}")
            if pending:
                total_pending = sum(p.get('balance_pending', 0) for p in pending)
                print(f"   Total Pending Amount: ₹{total_pending}")
        return success

    def test_customers(self):
        """Test customers API"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        success, response = self.run_test(
            "Get Customers",
            "GET",
            "customers",
            200,
            headers=headers
        )
        
        if success:
            customers = response.get('customers', [])
            print(f"   Total Customers: {len(customers)}")
        return success

    def test_staff_management(self):
        """Test staff management APIs"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Get existing staff
        success, response = self.run_test(
            "Get Staff List",
            "GET",
            "staff",
            200,
            headers=headers
        )
        
        if not success:
            return False
            
        print(f"   Existing Staff: {len(response.get('staff', []))}")
        
        # Create new staff
        timestamp = datetime.now().strftime("%H%M%S")
        success, _ = self.run_test(
            "Create Staff",
            "POST",
            "auth/create-user",
            200,
            data={
                "username": f"teststaff{timestamp}",
                "mobile": f"87654{timestamp}",
                "temporary_password": "StaffPass123!",
                "role": "staff",
                "permissions": {
                    "can_add_booking": True,
                    "can_take_payment": True,
                    "can_edit_price": False,
                    "can_view_reports": False
                }
            },
            headers=headers
        )
        return success

    def test_daily_report(self):
        """Test daily report API"""
        if not self.admin_token:
            print("❌ Skipping - No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        today = date.today().isoformat()
        
        success, response = self.run_test(
            "Get Daily Report",
            "GET",
            "reports/daily",
            200,
            headers=headers,
            params={"date": today}
        )
        
        if success:
            print(f"   Total Bookings: {response.get('total_bookings', 0)}")
            print(f"   Total Revenue: ₹{response.get('total_revenue', 0)}")
            print(f"   Pending Amount: ₹{response.get('pending_amount', 0)}")
        return success

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, _ = self.run_test(
            "Invalid Login Test",
            "POST",
            "auth/login",
            401,
            data={"username": "invalid", "password": "wrong"}
        )
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        success, _ = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "dashboard/super-admin",
            401
        )
        return success

def main():
    print("🚀 Starting Turf Management System API Tests")
    print("=" * 60)
    
    tester = TurfManagementAPITester()
    
    # Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    if not tester.test_super_admin_login():
        print("❌ Super admin login failed - stopping critical tests")
        return 1
        
    if not tester.test_admin_login():
        print("❌ Admin login failed - stopping critical tests")
        return 1
    
    # Security Tests
    print("\n🔒 SECURITY TESTS")
    print("-" * 30)
    tester.test_invalid_login()
    tester.test_unauthorized_access()
    
    # Dashboard Tests
    print("\n📊 DASHBOARD TESTS")
    print("-" * 30)
    tester.test_super_admin_dashboard()
    tester.test_admin_dashboard()
    
    # Admin Management Tests
    print("\n👥 ADMIN MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_create_admin()
    
    # Settings Tests
    print("\n⚙️ SETTINGS TESTS")
    print("-" * 30)
    tester.test_turf_settings()
    
    # Booking Tests
    print("\n📅 BOOKING TESTS")
    print("-" * 30)
    tester.test_available_slots()
    tester.test_create_booking()
    
    # Payment Tests
    print("\n💰 PAYMENT TESTS")
    print("-" * 30)
    tester.test_pending_payments()
    
    # Customer Tests
    print("\n👤 CUSTOMER TESTS")
    print("-" * 30)
    tester.test_customers()
    
    # Staff Tests
    print("\n👷 STAFF TESTS")
    print("-" * 30)
    tester.test_staff_management()
    
    # Reports Tests
    print("\n📈 REPORTS TESTS")
    print("-" * 30)
    tester.test_daily_report()
    
    # Print Results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['test']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())