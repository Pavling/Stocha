class User::SessionsController < Devise::SessionsController
  clear_respond_to 
  respond_to :json
  layout false
  before_action :authenticate_user!
  # GET /resource/sign_in
  def new
    @user = User.new
    render text: render_to_string(partial: 'new')
  end

  def get_current_user
    if user_signed_in?
      respond_with current_user
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end

  # POST /resource/sign_in
  # def create
  #   self.resource = warden.authenticate!(auth_options)
  #   set_flash_message(:notice, :signed_in) if is_flashing_format?
  #   sign_in(resource_name, resource)
  #   yield resource if block_given?
  #   respond_with action: render_to_string("successful")
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.for(:sign_in) << :attribute
  # end
end
