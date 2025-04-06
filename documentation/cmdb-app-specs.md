# CMDB Application: Core Features Specification

## 1. System Overview

This document outlines the core functionality of a Configuration Management Database (CMDB) application focused on asset management, user management, and asset assignment. The application will serve as a centralized repository for tracking IT assets and their assignments to users within an organization.

## 2. User Roles and Perspectives

### 2.1 User Roles

The system will support the following user roles:

1. **Standard User**: End-users who are assigned assets
2. **Manager**: Department managers who can view and manage assets for their team members
3. **HR**: Human Resources personnel who can view all employees and initiate requests
4. **Admin**: System administrators with full access to all features and system customization

### 2.2 User Perspectives

#### 2.2.1 Standard User Perspective

Standard users will have access to:
- View their own profile information
- View assets currently assigned to them
- View history of previously assigned assets
- Download asset assignment/return protocols
- Request new assets (optional workflow)
- Report issues with assigned assets

#### 2.2.2 Manager Perspective

Managers will have access to:
- View team members' profiles
- View assets assigned to their team members
- Generate assignment/return protocols for their team
- View department-level asset reports
- Approve/deny asset requests from team members
- Manage assets within their department

#### 2.2.3 HR Perspective

HR personnel will have access to:
- View all employee profiles (without asset information)
- Request new user accounts for new employees
- Request asset assignments for new or existing employees
- View organization structure and reporting relationships
- Generate employee-related reports
- Update basic employee information

#### 2.2.4 Admin Perspective

Administrators will have comprehensive access to:
- Manage all users (create, update, delete)
- Manage all assets (create, update, delete) 
- Assign roles to users
- Generate and customize all types of reports
- View system-wide asset allocation
- Manage asset assignments across departments
- Generate all types of protocols
- Configure notification settings
- Configure system settings
- Customize branding elements
- Manage email templates
- Create and modify user roles
- Set up integration with other systems
- Perform data backups and system maintenance

## 3. Core Features in Detail

### 3.1 User Management

#### 3.1.1 User Profiles

**Functionality:**
- Create new user profiles with required information
- Update existing user information
- Deactivate/reactivate user accounts
- Delete user accounts (with safeguards for assigned assets)
- Import users in bulk via CSV/Excel

**Data Points:**
- Basic Info: Full name, employee ID, email, phone number
- Organizational Info: Department, position, reporting manager
- System Info: Username, password (encrypted), role assignment
- Location Info: Office location, building, room/desk number
- Status: Active, inactive, on leave, terminated

**Scenarios:**
1. **New Employee Onboarding**:
   - HR creates a new user profile
   - System generates login credentials
   - User receives welcome email with login information

2. **Employee Transfer**:
   - Admin updates user's department and manager
   - System notifies new manager of the transfer
   - Assets remain assigned to the user

3. **Employee Termination**:
   - Admin marks user as inactive
   - System generates list of assets to be returned
   - Admin generates return protocols for all assets

### 3.2 Asset Management

#### 3.2.1 Asset Catalog

**Functionality:**
- Create new asset records with detailed information
- Update asset information and status
- Track asset lifecycle (procurement, deployment, maintenance, retirement)
- Categorize assets by type, location, and department
- Bulk import assets via CSV/Excel
- Manage asset warranties and service contracts

**Asset Types:**
- Computing Devices: Laptops, desktops, servers, tablets
- Mobile Devices: Smartphones, feature phones
- Peripherals: Monitors, keyboards, mice, headsets
- Network Equipment: Routers, switches, access points
- Other: Software licenses, printers, projectors, etc.

**Data Points:**
- Basic Info: Asset name, description, type, category
- Identification: Serial number, asset tag, MAC address, IMEI
- Procurement: Purchase date, cost, vendor, warranty information
- Technical: Make, model, specifications
- Status: Available, assigned, under repair, retired, lost
- Location: Current location, default storage location
- Customs: Custom fields for organization-specific data

**Scenarios:**
1. **New Asset Acquisition**:
   - Admin creates new asset records upon delivery
   - System assigns unique asset tags
   - Assets are marked as available for assignment

2. **Asset Maintenance**:
   - Admin changes asset status to "under repair"
   - System records maintenance details and timeline
   - Asset is marked as available upon return

3. **Asset Retirement**:
   - Admin initiates retirement process
   - System generates retirement documentation
   - Asset is marked as retired and removed from available inventory

### 3.3 Asset Assignment System

#### 3.3.1 Assignment Management

**Functionality:**
- Assign assets to users with effective dates
- Record assignment details including purpose and expected return date
- Generate assignment protocols during handover
- Track custody of assets through their lifecycle
- Process asset returns and transfers
- Maintain history of all assignments

**Data Points:**
- Assignment Info: User, asset, assignment date, expected return date
- Documentation: Assignment protocol ID, signed documents
- Status: Active assignment, scheduled return, overdue
- History: Previous assignments of the same asset
- Notes: Special conditions or requirements

**Scenarios:**
1. **New Asset Assignment**:
   - Admin selects user and available asset(s)
   - System generates assignment protocol
   - User and admin sign protocol (digital or physical)
   - Asset status changes to "assigned"
   - User receives notification of new assignment

2. **Asset Return**:
   - Admin initiates return process
   - System generates return protocol
   - Admin verifies asset condition
   - Asset status changes to "available" or "under repair"
   - Assignment record is archived

3. **Asset Transfer**:
   - Admin initiates transfer from User A to User B
   - System generates return protocol for User A
   - System generates assignment protocol for User B
   - Asset records are updated accordingly

### 3.4 Protocol Generation

#### 3.4.1 Document Creation

**Functionality:**
- Generate standardized documents for asset handover
- Create return receipts when assets are returned
- Support digital signatures for paperless workflows
- Store signed documents within the system
- Allow customization of protocol templates

**Protocol Types:**
- Asset Assignment Protocol
- Asset Return Protocol
- Temporary Asset Loan Agreement
- Asset Transfer Protocol
- Asset Disposal Certificate

**Data Included:**
- Protocol header with organization branding
- Date and reference number
- User information (assignee)
- Admin information (assigner)
- Asset details including condition notes
- Terms and conditions of use
- Signature fields for all parties
- Barcode or QR code for easy scanning

**Scenarios:**
1. **Digital Protocol Workflow**:
   - Admin initiates protocol generation
   - System creates PDF document with all required information
   - User and admin digitally sign the document
   - Signed document is stored in the system and emailed to user

2. **Physical Protocol Workflow**:
   - Admin generates printable protocol
   - Document is printed and physically signed
   - Admin uploads scanned copy to the system
   - Original physical copy is filed as per company policy

### 3.5 Notification System

#### 3.5.1 Email Notifications

**Functionality:**
- Send automated emails for key system events
- Use customizable email templates
- Include links to relevant system pages
- Support HTML formatting and organization branding
- Track email delivery and reading status

**Notification Types:**
- User Account Creation/Modification
- Asset Assignment
- Asset Return Reminder
- Asset Return Confirmation
- Warranty Expiration Warning
- Scheduled Maintenance Notification
- Report Generation Completion

**Customization Options:**
- Email template design and content
- Company logo and branding elements
- Signature block and contact information
- Notification frequency and timing
- Language and localization settings

**Scenarios:**
1. **Assignment Notification**:
   - System sends email to user upon new asset assignment
   - Email contains assignment details and protocol attachment
   - Links to user dashboard are included

2. **Return Reminder**:
   - System sends reminder 7 days before scheduled return date
   - Follow-up reminders are sent at configurable intervals
   - Manager is CC'd on overdue notices

### 3.6 Reporting System

#### 3.6.1 Standard Reports

**Functionality:**
- Generate comprehensive reports on asset allocation and status
- Filter reports by various parameters
- Export reports to multiple formats (PDF, Excel, CSV)
- Schedule automatic report generation
- Share reports with specific users or groups

**Report Types:**
- Asset Inventory Report
- User Assignment Report
- Department Allocation Report
- Asset Lifecycle Report
- Warranty Expiration Report
- Asset Utilization Report
- Compliance Report
- Available Assets by Category Report
- Organizational Hierarchy Report
- Asset Cost & Depreciation Report

**Customization Options:**
- Column selection and ordering
- Filtering criteria
- Grouping and sorting options
- Visual elements (charts, graphs)
- Output format preferences

**Scenarios:**
1. **Monthly Inventory Review**:
   - Admin schedules monthly inventory report
   - System generates report on the 1st of each month
   - Report is automatically emailed to finance department
   - Data includes current asset count, value, and allocation

2. **Audit Preparation**:
   - Admin generates comprehensive asset report
   - Report includes all assets with current assignment status
   - Historical assignment data is included for audit trail
   - Report is exported to Excel for further analysis

### 3.7 Administrative Features

#### 3.7.1 System Configuration

**Functionality:**
- Configure system-wide settings
- Customize user interface elements
- Manage email templates and notification rules
- Set up role-based permissions
- Configure integration with other systems

**Configuration Areas:**
- Branding: Logo, colors, favicon, application title
- User Interface: Dashboard layouts, menu options, default views
- Email: SMTP settings, template design, notification rules
- Security: Password policy, session timeout, 2FA settings
- Integration: API settings, third-party connections

**Scenarios:**
1. **Brand Customization**:
   - Super Admin uploads company logo
   - System applies logo to all pages and email templates
   - Colors are adjusted to match corporate identity
   - Login page is customized with company message

2. **Role Configuration**:
   - Admin creates new custom role "Department Asset Manager"
   - Permissions are defined for the new role
   - Role is assigned to specific users
   - Users receive notification of new permissions

## 4. User Interface Considerations

### 4.1 Dashboard Designs

#### 4.1.1 Standard User Dashboard

Key elements:
- Summary of assigned assets with quick status view
- Recent activity timeline
- Quick links to download assignment protocols
- Asset request button (if enabled)
- Notifications and alerts

#### 4.1.2 Manager Dashboard

Key elements:
- Team member list with asset counts
- Department asset utilization metrics
- Pending requests requiring approval
- Quick assignment initiation
- Department-level reports

#### 4.1.3 Admin Dashboard

Key elements:
- System-wide asset status summary
- User management shortcuts
- Recent system activities
- Alert indicators for issues requiring attention
- Quick report generation

### 4.2 Mobile Responsiveness

The application should:
- Adapt to different screen sizes and orientations
- Maintain full functionality on tablets
- Provide essential features on smartphones
- Optimize protocol display for mobile viewing
- Enable barcode/QR scanning via mobile camera

## 5. Integration Capabilities

### 5.1 Potential Integration Points

The system should be designed with integration capabilities for:
- HR systems for user synchronization
- Procurement systems for new asset imports
- Help desk systems for issue tracking
- Directory services (LDAP/Active Directory) for authentication
- Email systems for notification delivery
- Barcode/QR scanning hardware

## 6. Security Considerations

### 6.1 Data Protection

Key security features:
- Role-based access control to all functions
- Data encryption for sensitive information
- Audit logging of all system activities
- Secure protocol storage and transmission
- Regular automated backups
- Personal data handling in compliance with regulations

## 7. Implementation Phases

### 7.1 Recommended Phased Approach

1. **Phase 1 - Core Functionality**:
   - User management
   - Basic asset management
   - Simple assignment tracking
   - Basic protocol generation

2. **Phase 2 - Enhanced Features**:
   - Reporting capabilities
   - Email notifications
   - Protocol customization
   - Bulk operations

3. **Phase 3 - Advanced Capabilities**:
   - System customization
   - Integration with other systems
   - Advanced reporting
   - Mobile optimization

## 8. Use Case Scenarios

### 8.1 End-to-End Scenarios

#### 8.1.1 New Employee Onboarding

1. HR creates new user in the system
2. IT admin prepares standard equipment package
3. Assets are created/updated in the system
4. Assignment protocols are generated
5. User receives assets and signs protocols
6. User account receives notification with assets list
7. Assignment history begins for the user

#### 8.1.2 Employee Role Change

1. Manager requests additional equipment for employee
2. IT admin approves and prepares additional assets
3. New assignment protocols are generated
4. Previous assets remain assigned unless specified
5. User profile is updated with new role
6. Reports reflect updated asset allocation

#### 8.1.3 Employee Departure

1. HR notifies IT of employee departure
2. System generates list of assets to be returned
3. IT admin schedules asset return meeting
4. Return protocols are generated for each asset
5. Assets are returned and condition is noted
6. Assets are either returned to inventory or sent for repair
7. User account is deactivated

## 9. Database Structure Considerations

### 9.1 Key Entity Relationships

- **Users** - Stores user information and access credentials
- **Assets** - Contains detailed asset information
- **AssetTypes** - Defines categories and properties for assets
- **Assignments** - Links users to assets with temporal data
- **Protocols** - Stores generated documents and signature info
- **Departments** - Organizational structure information
- **Locations** - Physical locations for assets and users
- **Notifications** - Record of system notifications
- **AuditLog** - System activity tracking
- **Settings** - System configuration parameters

## 10. Technical Requirements

### 10.1 Minimal Viable Implementation

- Web-based interface with responsive design
- Database for persistent storage
- Authentication and authorization system
- Document generation capability
- Email integration
- Reporting engine
- Data import/export functionality

## 11. Future Expansion Possibilities

- Barcode/QR code scanning for quick asset processing
- Mobile application for on-the-go asset management
- Predictive analytics for procurement planning
- Automated discovery of network assets
- Integration with financial systems for depreciation tracking
- Maintenance scheduling and tracking
- License management for software assets

## 12. Reporting Capabilities in Detail

### 12.1 Standard Reports

The system will provide the following standard reports to support decision-making, planning, and audit requirements:

#### 12.1.1 Asset Inventory Report
**Purpose:** Provide a complete inventory of all assets in the system.
**Key Data Points:**
- Total count by asset type
- Value breakdown (acquisition cost, current value)
- Status distribution (available, assigned, under repair, retired)
- Location distribution
- Age analysis (0-1 year, 1-2 years, 2-3 years, 3+ years)
**Filtering Options:** Asset type, status, location, department, date range
**Usage Scenario:** IT management needs quarterly inventory counts for financial reconciliation.

#### 12.1.2 User Assignment Report
**Purpose:** Show which assets are assigned to specific users.
**Key Data Points:**
- User information
- List of all assigned assets with details
- Assignment dates
- Expected return dates for temporary assignments
- Protocol reference numbers
**Filtering Options:** User, department, asset type, assignment date range
**Usage Scenario:** Manager needs to verify all equipment assigned to a team member before project start.

#### 12.1.3 Department Allocation Report
**Purpose:** Analyze asset distribution across departments.
**Key Data Points:**
- Department breakdown
- Asset counts by type per department
- Total value of assets per department
- Average assets per employee by department
**Filtering Options:** Department, asset type, time period
**Usage Scenario:** Finance team needs to review IT resource allocation for budgeting purposes.

#### 12.1.4 Asset Lifecycle Report
**Purpose:** Track assets through their entire lifecycle.
**Key Data Points:**
- Procurement information
- Assignment history
- Maintenance/repair records
- Current status
- Projected retirement date
**Filtering Options:** Asset type, purchase date range, status
**Usage Scenario:** IT planning team needs to forecast replacement needs for the upcoming fiscal year.

#### 12.1.5 Warranty Expiration Report
**Purpose:** Identify assets with upcoming warranty expirations.
**Key Data Points:**
- Asset details
- Warranty start and end dates
- Days remaining on warranty
- Extended warranty options
- Current assignment status
**Filtering Options:** Date range (30/60/90 days), asset type, department
**Usage Scenario:** IT procurement needs to plan for warranty renewals or replacements in the next quarter.

#### 12.1.6 Asset Utilization Report
**Purpose:** Analyze how efficiently assets are being used.
**Key Data Points:**
- Percentage of time assigned vs. available
- Average assignment duration
- Time between assignments
- Assignment frequency
**Filtering Options:** Asset type, date range, department
**Usage Scenario:** Management wants to identify underutilized assets that could be reallocated.

#### 12.1.7 Compliance Report
**Purpose:** Ensure adherence to organizational policies and regulatory requirements.
**Key Data Points:**
- Protocol completion status
- Missing documentation
- Pending returns
- Overdue assets
- Regulatory compliance flags
**Filtering Options:** Compliance status, department, asset type
**Usage Scenario:** Audit preparation to ensure all asset documentation is complete and accurate.

#### 12.1.8 Available Assets by Category Report
**Purpose:** Show all assets currently available for assignment by category.
**Key Data Points:**
- Asset category/type
- Count of available assets
- Location of available assets
- Age and condition
- Last assignment details
**Filtering Options:** Asset category, location, condition
**Usage Scenario:** Manager needs to quickly identify available laptops for new team members.

#### 12.1.9 Organizational Hierarchy Report
**Purpose:** Visualize company structure and reporting relationships.
**Key Data Points:**
- Employee hierarchical relationships
- Direct reports visualization
- Department structure
- Management chains
- Optional asset summary by level
**Filtering Options:** Department, hierarchy level, include/exclude assets
**Usage Scenario:** HR needs to generate current organizational charts for board presentation, or IT needs to analyze asset distribution across management levels.

#### 12.1.10 Asset Cost & Depreciation Report
**Purpose:** Track financial aspects of asset inventory.
**Key Data Points:**
- Initial acquisition costs
- Current book value
- Depreciation schedule
- Total depreciation to date
- Projected value at end of life
**Filtering Options:** Asset type, purchase date range, cost range
**Usage Scenario:** Finance department needs depreciation figures for quarterly financial statements.

### 12.2 Report Customization

The system will provide the following customization options for all reports:

#### 12.2.1 Layout Options
- Tabular view
- List view
- Summary view with charts
- Detailed view with all data points
- Custom field selection

#### 12.2.2 Output Formats
- PDF (for sharing and printing)
- Excel (for further analysis)
- CSV (for data integration)
- HTML (for viewing in browser)
- JSON (for system integration)

#### 12.2.3 Scheduling Options
- On-demand generation
- Scheduled recurring reports (daily, weekly, monthly, quarterly)
- Event-triggered reports
- Report delivery via email
- Storage in report library

#### 12.2.4 Access Control
- Report visibility by role
- Restricted data fields based on permissions
- Report sharing options
- Audit trail of report access