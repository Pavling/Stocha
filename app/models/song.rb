class Song
  include Mongoid::Document

  belongs_to :user

  field :title, type: String, default: ""
  field :song_data, type: Hash, default: {}
  field :bpm, type: Integer, default: 120
  validates_associated :user

end
