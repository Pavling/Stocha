class SongsController < ApplicationController
	before_filter :redirect_unless_ajax
	# before_action :authenticate_user! -- just for create/edit etc

	def index
		@songs = Song.all.to_a
		render json: {content: render_to_string(partial: 'index.html.erb')}
	end

	def new 
		@song = Song.new
		render json: {content: render_to_string(partial: 'new.html.erb')}
	end

	def create
		Song.create(title: params["title"], song_data: params["songData"])
		render html: "<h4>Save successful!</h4>"
	end

	def show
		@song = Song.find_by(_id: params["id"])
		render json: {title: @song.title, song_data: @song.song_data}
	end

	private

	def redirect_unless_ajax
		unless request.xhr?
			redirect_to root_path
		end
	end

end

