import { organizationRoles } from '~/lib/auth-permissions'

describe('Better Auth organization role permissions', () => {
  it('grants owners the complete wedding workspace permission matrix', () => {
    const result = organizationRoles.owner.authorize({
      organization: ['update', 'delete'],
      member: ['create', 'update', 'delete'],
      invitation: ['create', 'cancel'],
      guest_invitation: ['read', 'create', 'send', 'resend', 'cancel'],
      guest_event: ['read', 'add_guest_to_event', 'remove_guest_from_event'],
      rsvp: ['read_responses', 'edit_response', 'export', 'reopen_submission'],
      event: ['read', 'create', 'update', 'delete', 'rsvp_policy_update'],
      guest: ['read', 'create', 'update', 'delete', 'import'],
      vendor: ['read', 'create', 'update', 'delete'],
      vendor_quote: ['read', 'create', 'update', 'delete'],
      budget: ['read', 'create', 'update', 'delete'],
      website: ['read', 'update', 'publish', 'password_update'],
      wedding: ['read', 'update'],
    })

    expect(result.success).toBe(true)
  })

  it('lets admins manage the workspace but not delete it', () => {
    expect(
      organizationRoles.admin.authorize({
        organization: ['update'],
        member: ['create', 'update', 'delete'],
        invitation: ['create', 'cancel'],
      }).success
    ).toBe(true)

    expect(organizationRoles.admin.authorize({ organization: ['delete'] }).success).toBe(false)
  })

  it('lets members manage wedding planning data but not workspace membership', () => {
    expect(
      organizationRoles.member.authorize({
        wedding: ['read', 'update'],
        event: ['read', 'create', 'update', 'delete'],
        guest: ['read', 'create', 'update', 'delete'],
        vendor: ['read', 'create', 'update', 'delete'],
        budget: ['read', 'create', 'update', 'delete'],
      }).success
    ).toBe(true)

    expect(
      organizationRoles.member.authorize({
        member: ['create'],
        invitation: ['create'],
        organization: ['update'],
      }).success
    ).toBe(false)
  })

  it('denies viewers all workspace permissions', () => {
    expect(
      organizationRoles.viewer.authorize({
        wedding: ['read'],
        event: ['read'],
        guest: ['read'],
      }).success
    ).toBe(false)
  })
})
