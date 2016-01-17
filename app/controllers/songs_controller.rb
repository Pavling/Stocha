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
		Song.create(title: params["title"], song_data: params["songData"])
		render html: "<h4>Save successful!</h4>"
	end


	private

	def redirect_unless_ajax
		unless request.xhr?
			redirect_to root_path
		end
	end

end

