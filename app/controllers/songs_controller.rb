class SongsController < ApplicationController
	before_filter :redirect_unless_ajax
	skip_before_action :verify_authenticity_token
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
		Song.create(title: params["title"], song_data: params["songData"], user_id: params["user_id"])
		render html: "Save successful!"
	end

	def show
		@song = Song.find(params["id"])
		render json: {title: @song.title, song_data: @song.song_data, user_id: @song.user_id, song_id: @song.id}
	end

	def update
		@song = Song.find(params["id"])
		@song.update(song_data: params["songData"])
		render :nothing => true, :status => 200, :content_type => 'text/html'
	end

	private

	def redirect_unless_ajax
		unless request.xhr?
			redirect_to root_path
		end
	end

end

