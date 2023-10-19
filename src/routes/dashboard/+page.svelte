<script>
	import {
		Button,
		ClickableTile,
		Header,
		HeaderUtilities,
		InlineNotification,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink,
		SideNavMenu,
		Tile
	} from 'carbon-components-svelte';

	import {
		Box,
		Bullhorn,
		ContainerSoftware,
		Dashboard,
		Debug,
		Education,
		EventSchedule,
		Information,
		Logout,
		Money,
		Recycle,
		Report,
		Settings,
		SettingsAdjust,
		UserAvatarFilledAlt
	} from 'carbon-icons-svelte';
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">Dashboard</div>
	<HeaderUtilities>
		<Button icon={Debug} iconDescription="Report a bug" tooltipPosition="left" kind="ghost" />
		<Button
			icon={UserAvatarFilledAlt}
			iconDescription="Account Settings"
			tooltipPosition="left"
			kind="secondary"
		/>
		<Button icon={Logout} iconDescription="Logout" tooltipPosition="left" kind="danger" />
	</HeaderUtilities>
</Header>

<SideNav rail>
	<SideNavItems>
		<SideNavLink isSelected icon={Dashboard} href="/dashboard" text="Dashboard" />
		<SideNavDivider />
		<SideNavLink icon={Debug} href="/bugs" text="Reported Bugs" />
		<SideNavDivider />
		<SideNavMenu icon={SettingsAdjust} text="Management Modules">
			<SideNavLink href="/administrator/users" text="User Management" />
			<SideNavLink href="/administrator/sections" text="Section Management" />
			<SideNavLink href="/administrator/subjects" text="Subject Management" />
			<SideNavLink href="/administrator/schedules" text="Schedule Management" />
			<SideNavLink href="/administrator/bulletin" text="Bulletin Management" />
		</SideNavMenu>
		<SideNavMenu icon={Education} text="Academic Modules">
			<SideNavLink href="/academic/admission" text="Admissions" />
			<SideNavLink href="/academic/enrollment" text="Enrollments" />
			<SideNavLink href="/academic/sections" text="Sections" />
			<SideNavLink href="/academic/subjects" text="Subjects" />
			<SideNavLink href="/academic/gradebook" text="Gradebook" />
			<hr />
			<SideNavLink href="/guidance/records" text="Guidance Records" />
			<SideNavLink href="/guidance/defaults" text="Guidance Settings" />
		</SideNavMenu>
		<SideNavMenu icon={Money} text="Financial Modules">
			<SideNavLink href="/finance/transact" text="Financial Transactions" />
			<SideNavLink href="/finance/defaults" text="Financial Settings" />
		</SideNavMenu>
		<SideNavMenu icon={ContainerSoftware} text="Miscellaneous Modules">
			<SideNavLink href="/library" text="Library Management" />
			<SideNavLink href="/health" text="Health Records" />
		</SideNavMenu>
		<SideNavDivider />
		<SideNavLink icon={Information} href="/system/about" text="System Information" />
		<SideNavLink icon={Report} href="/system/reports" text="System Reports" />
		<SideNavLink icon={Settings} href="/system/defaults" text="System Settings" />
		<SideNavDivider />
		<SideNavMenu icon={Box} text="Archives">
			<SideNavLink href="/archives/system" text="System Archives" />
			<SideNavLink href="/archives/student" text="Student Archives" />
			<SideNavLink href="/archives/employee" text="Employee Archives" />
		</SideNavMenu>
		<SideNavDivider />
		<SideNavLink icon={EventSchedule} href="/student/schedules" text="Class Schedules" />
	</SideNavItems>
</SideNav>

<div class="flex flex-col pt-16 pl-16 pr-4 w-full gap-4">
	<div class="flex flex-col">
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="col-span-2 h-auto">
				<InlineNotification
					hideCloseButton
					lowContrast
					kind="info"
					title="Project JOAN is still in beta."
					subtitle="Some features might not work as expected. Report a bug if you encounter one."
				/>
				<InlineNotification
					hideCloseButton
					lowContrast
					kind="warning"
					title="Scheduled Maintenance:"
					subtitle="System will be offline from 00:00 to 05:00 on 10 November 2023 for a scheduled maintenance."
				/>
			</div>
			<ClickableTile>
				<h5>Students</h5>
				<br />
				<hr />
				<br />
				<p class="text-sm">Online</p>
				<h2 class="font-medium">0</h2>
				<br />
				<p class="text-sm">Active</p>
				<p class="font-medium">0</p>
			</ClickableTile>
			<ClickableTile>
				<h5>Users</h5>
				<br />
				<hr />
				<br />
				<p class="text-sm">Online</p>
				<h2 class="font-medium">0</h2>
				<br />
				<p class="text-sm">Active</p>
				<p class="font-medium">0</p>
			</ClickableTile>
		</div>
	</div>
	<div class="flex flex-col">
		<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
			<h6 class="text-white">Campus Bulletin</h6>
			<Button
				kind="secondary"
				size="small"
				icon={Recycle}
				iconDescription="Reload"
				tooltipPosition="left"
			/>
		</div>
		<Tile class="h-auto">
			<div class="flex flex-wrap">
				<div class="flex flex-col gap-2 p-2 w-full h-auto lg:w-1/4">
					<div class="h-1 rounded-xl bg-red-600" />
					<div class="flex flex-col w-full">
						<p class="italic text-sm"><strong>Announcement</strong></p>
						<p class="text-lg">Suspension of Classes</p>
						<p class="italic text-xs">by: Admin Arcy</p>
					</div>
					<hr />
					<p class="inline-flex flex-col text-sm whitespace-normal">
						Due to inclement weather, classes are suspended for Monday, 09 October 2023. Classes
						will resume on Tuesday if the weather permits.
					</p>
				</div>
				<div class="flex flex-col gap-2 p-2 w-full h-auto lg:w-1/4">
					<div class="flex w-full h-full items-center justify-center rounded-lg bg-neutral-100">
						<Bullhorn />
					</div>
				</div>
			</div>
		</Tile>
	</div>
</div>
