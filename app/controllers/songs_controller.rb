class SongsController < ApplicationController

	before_filter :redirect_unless_ajax

	def index
		@songs = Songs.all
	end

	def new 
		@song = Song.new
		render json: {content: render_to_string(partial: 'new.html.erb')}
	end

	def create
		@params = params
		@song = Song.new
		
	end


	private

	def redirect_unless_ajax
		unless request.xhr?
			redirect_to root_path
		end
	end

end

