class User::SessionsController < Devise::SessionsController

  clear_respond_to
  respond_to :json
  layout false
  before_action :authenticate_user!
  before_filter :redirect_unless_ajax
  skip_before_action :verify_authenticity_token
  skip_before_filter :verify_signed_out_user

  # GET /resource/sign_in
  def new
    @user = User.new
    render text: render_to_string(partial: 'new')
  end

  def get_current_user
    # binding.pry
    if user_signed_in?
      respond_with current_user
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end

  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
  end

  private

  def redirect_unless_ajax
    unless request.xhr?
      redirect_to root_path
    end
  end

end
