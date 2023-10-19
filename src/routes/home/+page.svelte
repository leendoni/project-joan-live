<script>
	import {
		Button,
		Header,
		HeaderUtilities,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink
	} from 'carbon-components-svelte';
	import {
		AccessibilityColorFilled,
		Bullhorn,
		Debug,
		EventSchedule,
		Help,
		Login,
		Network_4,
		Partnership,
		PenFountain,
		Quotes,
		UpdateNow
	} from 'carbon-icons-svelte';

	let sideBR = false;
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">Homepage</div>
	<HeaderUtilities>
        <Button icon={Debug} iconDescription="Report a bug" tooltipPosition="left" kind="ghost"/>
		<Button href='/student/application' icon={PenFountain} iconDescription="Register" tooltipPosition="left" />
		<Button href='/login' icon={Login} iconDescription="Login" tooltipPosition="left" />
	</HeaderUtilities>
</Header>

<SideNav bind:isOpen={sideBR} rail>
	<SideNavItems>
		<SideNavLink icon={Help} href="/" text="What is Project JOAN?" />
		<SideNavLink icon={AccessibilityColorFilled} href="/" text="Who uses Project JOAN?" />
		<SideNavLink icon={Network_4} href="/" text="The Network" />
		<SideNavLink icon={Partnership} href="/" text="Partners" />
		<SideNavDivider />
		<SideNavLink icon={Bullhorn} href="/" text="Recent News" />
		<SideNavLink icon={UpdateNow} href="/" text="Updates and Bugfixes" />
		<SideNavDivider />
		<SideNavLink icon={Quotes} href="" text="Testimonials" />
		<SideNavLink icon={EventSchedule} href="" text="Schedule a Demo" />
	</SideNavItems>
</SideNav>
