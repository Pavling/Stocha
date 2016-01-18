class Users::RegistrationsController < Devise::RegistrationsController

	before_filter :redirect_unless_ajax

	# def index
	# end

	def new
	end

	def create
	end

	def show
	end

	def edit
	end

	def update
	end

	def destroy
	end

	private

	def redirect_unless_ajax
		unless request.xhr?
			redirect_to root_path
		end
	end

end