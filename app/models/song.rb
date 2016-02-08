class Song < ActiveRecord::Base
  belongs_to :user

  validates_associated :user

  serialize :song_data

end
