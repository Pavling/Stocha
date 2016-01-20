class Song
  include Mongoid::Document

  belongs_to :user

  field :title, type: String, default: ""
  field :song_data, type: Hash, default: {}
  validates_associated :user

end
